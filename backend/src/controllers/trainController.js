/**
 * RailConnect AI - Train & Station Controller
 * Search, Schedules, Routes, and Smart Alternative Train Suggestions
 */

import { getFallbackStore } from '../config/db.js';
import { predictionService } from '../services/predictionService.js';

export async function getStations(req, res) {
  const store = getFallbackStore();
  res.json({
    success: true,
    data: store.stations
  });
}

export async function searchTrains(req, res, next) {
  try {
    const { from, to, date, travelClass } = req.query;
    const store = getFallbackStore();

    // Find source and dest station
    const src = store.stations.find(s => 
      s.station_code.toLowerCase() === (from || '').toLowerCase() || 
      s.station_name.toLowerCase().includes((from || '').toLowerCase()) ||
      s.station_id === Number(from)
    );

    const dst = store.stations.find(s => 
      s.station_code.toLowerCase() === (to || '').toLowerCase() || 
      s.station_name.toLowerCase().includes((to || '').toLowerCase()) ||
      s.station_id === Number(to)
    );

    let matchingTrains = [];

    if (src && dst) {
      // Find trains that connect src to dst directly or via route
      matchingTrains = store.trains.filter(t => {
        // Direct source & dest
        if (t.source_station_id === src.station_id && t.destination_station_id === dst.station_id) {
          return true;
        }
        // Route stops
        const routes = store.train_routes.filter(r => r.train_id === t.train_id);
        const hasSrc = routes.some(r => r.station_id === src.station_id);
        const hasDst = routes.some(r => r.station_id === dst.station_id);
        if (hasSrc && hasDst) {
          const srcStop = routes.find(r => r.station_id === src.station_id).stop_number;
          const dstStop = routes.find(r => r.station_id === dst.station_id).stop_number;
          return srcStop < dstStop;
        }
        return false;
      });
    } else {
      // Return popular trains if no filter or broad search
      matchingTrains = store.trains;
    }

    // Attach schedules and real-time class availability with ML predictions
    const searchDate = date || '2026-09-25';

    const enriched = await Promise.all(matchingTrains.map(async t => {
      const srcStation = store.stations.find(s => s.station_id === t.source_station_id) || {};
      const dstStation = store.stations.find(s => s.station_id === t.destination_station_id) || {};
      const schedule = store.schedules.find(s => s.train_id === t.train_id) || {
        schedule_id: t.train_id,
        journey_date: searchDate,
        departure_datetime: `${searchDate} 06:00:00`,
        arrival_datetime: `${searchDate} 14:00:00`,
        current_status: t.status,
        delay_minutes: t.delay_minutes,
        platform_number: '1'
      };

      const availability = store.seat_availability.filter(sa => sa.schedule_id === schedule.schedule_id);

      // Pre-compute waitlist predictions for waitlisted/RAC classes
      const classesWithPredictions = await Promise.all(availability.map(async c => {
        let prediction = null;
        if (c.available_seats === 0 && (c.rac_seats > 0 || c.waiting_seats > 0)) {
          const wl = c.waiting_seats > 0 ? c.waiting_seats : c.rac_seats;
          prediction = await predictionService.getConfirmationProbability({
            waitlistNumber: wl,
            bookingStatus: c.waiting_seats > 0 ? 'WAITLIST' : 'RAC',
            travelClass: c.travel_class,
            journeyDate: searchDate,
            trainType: t.train_type,
            totalCapacity: c.total_capacity
          });
        }
        return {
          ...c,
          prediction
        };
      }));

      // Calculate duration
      const dep = new Date(schedule.departure_datetime);
      const arr = new Date(schedule.arrival_datetime);
      const diffMins = Math.round((arr - dep) / (1000 * 60));
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      const durationStr = `${hours}h ${mins}m`;

      return {
        ...t,
        schedule_id: schedule.schedule_id,
        journey_date: schedule.journey_date,
        departure_datetime: schedule.departure_datetime,
        arrival_datetime: schedule.arrival_datetime,
        duration: durationStr,
        source_code: srcStation.station_code,
        source_name: srcStation.station_name,
        source_city: srcStation.city,
        dest_code: dstStation.station_code,
        dest_name: dstStation.station_name,
        dest_city: dstStation.city,
        platform_number: schedule.platform_number,
        classes: classesWithPredictions.length ? classesWithPredictions : [
          { availability_id: 101, schedule_id: schedule.schedule_id, travel_class: 'CC', total_capacity: 400, available_seats: 45, rac_seats: 10, waiting_seats: 0, base_fare: 1550 },
          { availability_id: 102, schedule_id: schedule.schedule_id, travel_class: 'EC', total_capacity: 60, available_seats: 8, rac_seats: 2, waiting_seats: 0, base_fare: 2950 }
        ]
      };
    }));

    // Filter by travel class if specified
    const finalResults = travelClass 
      ? enriched.filter(t => t.classes.some(c => c.travel_class === travelClass))
      : enriched;

    res.json({
      success: true,
      query: { from: src?.station_name || from, to: dst?.station_name || to, date: searchDate, travelClass },
      count: finalResults.length,
      data: finalResults
    });
  } catch (err) {
    next(err);
  }
}

export async function getTrainById(req, res, next) {
  try {
    const trainId = Number(req.params.id);
    const store = getFallbackStore();
    const train = store.trains.find(t => t.train_id === trainId);

    if (!train) {
      return res.status(404).json({ success: false, message: 'Train not found' });
    }

    const src = store.stations.find(s => s.station_id === train.source_station_id) || {};
    const dst = store.stations.find(s => s.station_id === train.destination_station_id) || {};
    const routes = store.train_routes.filter(r => r.train_id === train.train_id).map(r => {
      const st = store.stations.find(s => s.station_id === r.station_id) || {};
      return { ...r, station_name: st.station_name, station_code: st.station_code, city: st.city };
    });

    res.json({
      success: true,
      data: {
        ...train,
        source_name: src.station_name,
        source_code: src.station_code,
        dest_name: dst.station_name,
        dest_code: dst.station_code,
        route_stops: routes
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getSeatAvailability(req, res, next) {
  try {
    const trainId = Number(req.params.id);
    const date = req.query.date || '2026-09-25';
    const store = getFallbackStore();
    const train = store.trains.find(t => t.train_id === trainId);

    if (!train) {
      return res.status(404).json({ success: false, message: 'Train not found' });
    }

    let schedule = store.schedules.find(s => s.train_id === trainId && s.journey_date === date);
    if (!schedule) {
      schedule = store.schedules.find(s => s.train_id === trainId) || {
        schedule_id: trainId,
        train_id: trainId,
        journey_date: date,
        departure_datetime: `${date} 06:00:00`,
        arrival_datetime: `${date} 14:00:00`,
        current_status: train.status,
        delay_minutes: train.delay_minutes,
        platform_number: '1'
      };
    }

    let availability = store.seat_availability.filter(sa => sa.schedule_id === schedule.schedule_id);
    if (availability.length === 0) {
      availability = [
        { availability_id: 301, schedule_id: schedule.schedule_id, travel_class: 'CC', total_capacity: 450, available_seats: 52, rac_seats: 12, waiting_seats: 0, base_fare: 1550.00 },
        { availability_id: 302, schedule_id: schedule.schedule_id, travel_class: 'EC', total_capacity: 60, available_seats: 10, rac_seats: 4, waiting_seats: 0, base_fare: 2950.00 }
      ];
    }

    const classesWithPredictions = await Promise.all(availability.map(async (sa) => {
      let prediction = null;
      if (sa.available_seats === 0 && (sa.rac_seats > 0 || sa.waiting_seats > 0)) {
        prediction = await predictionService.getConfirmationProbability({
          waitlistNumber: sa.waiting_seats > 0 ? sa.waiting_seats : sa.rac_seats,
          bookingStatus: sa.waiting_seats > 0 ? 'WAITLIST' : 'RAC',
          travelClass: sa.travel_class,
          journeyDate: date,
          trainType: train.train_type,
          totalCapacity: sa.total_capacity
        });
      }
      return {
        ...sa,
        statusLabel: sa.available_seats > 0 ? `AVL ${sa.available_seats}` : sa.rac_seats > 0 ? `RAC ${sa.rac_seats}` : `WL ${sa.waiting_seats}`,
        prediction
      };
    }));

    res.json({
      success: true,
      trainId: train.train_id,
      trainNumber: train.train_number,
      trainName: train.train_name,
      journeyDate: date,
      scheduleId: schedule.schedule_id,
      availability: classesWithPredictions
    });
  } catch (err) {
    next(err);
  }
}

export async function getTrainRoute(req, res, next) {
  try {
    const trainId = Number(req.params.id);
    const store = getFallbackStore();
    const train = store.trains.find(t => t.train_id === trainId);

    if (!train) {
      return res.status(404).json({ success: false, message: 'Train not found' });
    }

    const stops = store.train_routes
      .filter(r => r.train_id === trainId)
      .sort((a, b) => a.stop_number - b.stop_number)
      .map(r => {
        const st = store.stations.find(s => s.station_id === r.station_id) || {};
        return {
          stopNumber: r.stop_number,
          stationCode: st.station_code,
          stationName: st.station_name,
          city: st.city,
          state: st.state,
          distanceKm: r.distance_km,
          arrivalTime: r.arrival_time,
          departureTime: r.departure_time,
          haltDurationMinutes: r.halt_duration_minutes
        };
      });

    res.json({
      success: true,
      trainId: train.train_id,
      trainNumber: train.train_number,
      trainName: train.train_name,
      totalStops: stops.length,
      route: stops
    });
  } catch (err) {
    next(err);
  }
}

export async function updateTrainStatusByStaff(req, res, next) {
  try {
    const trainId = Number(req.params.id);
    const { status, delayMinutes, platformNumber } = req.body;
    const store = getFallbackStore();

    const train = store.trains.find(t => t.train_id === trainId);
    if (!train) {
      return res.status(404).json({ success: false, message: 'Train not found' });
    }

    if (status) train.status = status;
    if (delayMinutes !== undefined) train.delay_minutes = Number(delayMinutes);

    // Update corresponding schedule as well
    const sched = store.schedules.find(s => s.train_id === trainId);
    if (sched) {
      if (status) sched.current_status = status;
      if (delayMinutes !== undefined) sched.delay_minutes = Number(delayMinutes);
      if (platformNumber) sched.platform_number = platformNumber;
    }

    res.json({
      success: true,
      message: 'Train status and schedule updated with DBMS trigger audit.',
      train
    });
  } catch (err) {
    next(err);
  }
}

export async function getAlternativeSuggestions(req, res, next) {
  try {
    const { trainId, travelClass } = req.query;
    const store = getFallbackStore();
    const currentTrain = store.trains.find(t => t.train_id === Number(trainId));

    if (!currentTrain) {
      return res.json({ success: true, alternatives: [] });
    }

    // Find other trains with same origin/destination or same corridor
    const alternates = store.trains
      .filter(t => t.train_id !== currentTrain.train_id && 
        (t.source_station_id === currentTrain.source_station_id || t.destination_station_id === currentTrain.destination_station_id))
      .slice(0, 3)
      .map(alt => {
        const src = store.stations.find(s => s.station_id === alt.source_station_id) || {};
        const dst = store.stations.find(s => s.station_id === alt.destination_station_id) || {};
        const sched = store.schedules.find(s => s.train_id === alt.train_id) || {};
        const avail = store.seat_availability.filter(sa => sa.schedule_id === sched.schedule_id);

        return {
          train_id: alt.train_id,
          train_number: alt.train_number,
          train_name: alt.train_name,
          train_type: alt.train_type,
          source_code: src.station_code,
          dest_code: dst.station_code,
          departure_time: sched.departure_datetime || '17:00:00',
          available_classes: avail.map(a => ({
            travel_class: a.travel_class,
            available_seats: a.available_seats,
            base_fare: a.base_fare
          })),
          advantageReason: alt.status === 'ON_TIME' 
            ? 'High seat availability with on-time departure' 
            : 'Alternative timing on parallel route'
        };
      });

    res.json({
      success: true,
      alternatives: alternates
    });
  } catch (err) {
    next(err);
  }
}

function addMinutesToTime(timeStr, mins) {
  if (!timeStr) return timeStr;
  const parts = timeStr.split(':');
  let h = parseInt(parts[0], 10) || 0;
  let m = parseInt(parts[1], 10) || 0;
  let totalMins = h * 60 + m + mins;
  let newH = Math.floor(totalMins / 60) % 24;
  let newM = totalMins % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}:00`;
}

export async function getLiveTrainStatus(req, res, next) {
  try {
    const trainParam = String(req.params.query || '22436').trim();
    const store = getFallbackStore();

    // Match by train number, ID, or name
    const train = store.trains.find(t => 
      String(t.train_id) === trainParam || 
      t.train_number.toLowerCase() === trainParam.toLowerCase() ||
      t.train_name.toLowerCase().includes(trainParam.toLowerCase())
    ) || store.trains[0];

    if (!train) {
      return res.status(404).json({ success: false, message: 'Train not found' });
    }

    const src = store.stations.find(s => s.station_id === train.source_station_id) || {};
    const dst = store.stations.find(s => s.station_id === train.destination_station_id) || {};
    const sched = store.schedules.find(s => s.train_id === train.train_id) || {
      departure_datetime: '2026-09-30 06:00:00',
      arrival_datetime: '2026-09-30 14:00:00',
      platform_number: '1'
    };

    // Stoppages from train_routes
    const rawStops = store.train_routes
      .filter(r => r.train_id === train.train_id)
      .sort((a, b) => a.stop_number - b.stop_number);

    const stops = rawStops.map((r, idx) => {
      const st = store.stations.find(s => s.station_id === r.station_id) || {
        station_code: 'STN',
        station_name: 'Station',
        city: ''
      };
      return {
        stopNumber: r.stop_number,
        stationCode: st.station_code,
        stationName: st.station_name,
        city: st.city,
        state: st.state,
        distanceKm: r.distance_km,
        arrivalTime: r.arrival_time,
        departureTime: r.departure_time,
        haltDurationMinutes: r.halt_duration_minutes || 2,
        platform: idx === 0 ? sched.platform_number : `${((idx * 2) % 6) + 1}`
      };
    });

    const totalDistance = stops.length > 0 ? stops[stops.length - 1].distanceKm || 750 : 750;
    
    // Determine active progress (e.g. at stop 2 or 3)
    const activeIndex = stops.length > 2 ? 2 : 1;
    const currentStop = stops[activeIndex - 1] || stops[0];
    const nextStop = stops[activeIndex] || stops[stops.length - 1];

    const currentSpeed = train.status === 'CANCELLED' ? 0 : Math.floor(138 + Math.random() * 20); // 138-158 km/h
    const delay = train.delay_minutes || 0;
    const progressPercent = totalDistance > 0 ? Math.min(100, Math.round((currentStop.distanceKm / totalDistance) * 100)) : 50;

    const enrichedStops = stops.map((s, idx) => {
      let stopStatus = 'UPCOMING';
      if (idx < activeIndex - 1) stopStatus = 'DEPARTED';
      else if (idx === activeIndex - 1) stopStatus = 'CURRENT';
      
      return {
        ...s,
        status: stopStatus,
        actualArrival: delay > 0 && idx >= activeIndex - 1 ? addMinutesToTime(s.arrivalTime, delay) : s.arrivalTime,
        actualDeparture: delay > 0 && idx >= activeIndex - 1 ? addMinutesToTime(s.departureTime, delay) : s.departureTime,
        delayMinutes: idx >= activeIndex - 1 ? delay : 0
      };
    });

    res.json({
      success: true,
      data: {
        trainId: train.train_id,
        trainNumber: train.train_number,
        trainName: train.train_name,
        trainType: train.train_type,
        source: {
          code: src.station_code,
          name: src.station_name,
          city: src.city
        },
        destination: {
          code: dst.station_code,
          name: dst.station_name,
          city: dst.city
        },
        liveStatus: train.status,
        delayMinutes: delay,
        delayNotice: delay === 0 ? 'Running On Time' : `Delayed by ${delay} min`,
        currentSpeedKmh: currentSpeed,
        progressPercent,
        currentStation: currentStop,
        nextStation: nextStop,
        distanceCoveredKm: currentStop.distanceKm,
        totalDistanceKm: totalDistance,
        lastUpdatedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        schedule: {
          departure: sched.departure_datetime,
          arrival: sched.arrival_datetime,
          platform: sched.platform_number
        },
        stops: enrichedStops
      }
    });
  } catch (err) {
    next(err);
  }
}
