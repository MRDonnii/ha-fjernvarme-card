# Fjernvarme Card

An animated Home Assistant Lovelace card for a district heating (fjernvarme) substation
unit, built around the entity layout exposed by Wavin Calefa / Sentio units and a
Kamstrup wireless M-Bus billing meter — but any set of matching sensors will work.

The card shows three animated pipe "lanes":

- **Primary / district heating** (supply and return from the utility)
- **Central heating** (radiator supply/return)
- **Domestic hot water** (cold in / hot out)

Each pipe's color runs along a configurable temperature gradient (from a "cold" color to
a "hot" color) and animates only while there's actual flow — a stopped/idle circuit
renders as a plain gray pipe. Status circles across the top and bottom show unit health
(alarms, pressure, cooling/ΔT), pump/valve state, standby/vacation switches, and outdoor
temperature, each with a color-coded ring.

The DHW circulation/bypass loop (the recirculation line that keeps hot-water pipes warm)
is drawn as a small loop tapped onto the domestic-hot-water pipe's own edge, rather than
as a separate lane — unlike the main lanes, the loop itself only appears while the
circulation pump is actually running; its status badge stays visible either way.

## Installation

### HACS (custom repository)

1. In HACS, go to **Frontend** → the three-dot menu → **Custom repositories**.
2. Add `https://github.com/MRDonnii/ha-fjernvarme-card` as type **Dashboard**.
3. Install **Fjernvarme Card** and add the resource if HACS doesn't do it automatically.

### Manual

1. Download `ha-fjernvarme-card.js` from the latest release (or this repo).
2. Copy it to `config/www/community/ha-fjernvarme-card/ha-fjernvarme-card.js`.
3. Add it as a dashboard resource:
   ```yaml
   url: /local/community/ha-fjernvarme-card/ha-fjernvarme-card.js
   type: module
   ```

## Usage

Add the card via the dashboard editor (search for "Fjernvarme Card") or in YAML:

```yaml
type: custom:fjernvarme-card
entities:
  primary_supply: sensor.district_heating_supply_temperature
  primary_return: sensor.district_heating_return_temperature
  primary_cooling: sensor.district_heating_cooling
  pressure: sensor.system_pressure
  meter_energy_total: sensor.heat_meter_total_energy
  meter_volume_total: sensor.heat_meter_total_volume
  meter_flow: sensor.heat_meter_flow
  ch_supply: sensor.radiator_supply_temperature
  ch_return: sensor.radiator_return_temperature
  ch_valve: sensor.radiator_valve_position
  ch_outdoor: sensor.outdoor_temperature
  ch_pump: sensor.heating_pump_status
  dhw_cold_in: sensor.cold_water_temperature
  dhw_hot_out: sensor.hot_water_temperature
  dhw_flow: sensor.dhw_flow
  dhw_valve: sensor.dhw_valve_position
  dhw_setpoint: sensor.dhw_setpoint
  dhw_status: sensor.dhw_status
  circulation_temp: sensor.circulation_return_temperature
  circulation_status: sensor.circulation_pump_status
  circulation_bypass_temp: sensor.circulation_bypass_temperature
  standby: switch.unit_standby
  vacation: switch.unit_vacation
  sentio_active: input_boolean.heat_call_enabled
  sentio_status: sensor.heat_call_status
  sentio_call_active: input_boolean.heat_call_in_progress
  sentio_fejl: binary_sensor.heat_call_fault
  alarms:
    - binary_sensor.low_pressure_warning
    - binary_sensor.sensor_failure
appearance:
  flow_animation: true
  show_labels: true
  show_temperatures: true
  compact: false
temperature_thresholds:
  white: 5
  blue: 20
  green: 35
  yellow: 45
  orange: 55
  red: 65
cooling_target:
  optimal: 30
  tolerance: 5
```

All `entities` keys are optional — any pipe, badge, or status circle whose entity isn't
configured is simply omitted from the render. `alarms` accepts any list of
`binary_sensor` entities; the "Enhed" (unit) circle turns red and reports a count when
any of them are active.

## Configuration reference

| Key | Description |
|---|---|
| `entities.primary_supply` / `primary_return` | District heating supply/return temperature |
| `entities.primary_cooling` | Cooling / ΔT reading, also drives the AFKØLING circle's background gradient |
| `entities.pressure` | System pressure |
| `cooling_target.optimal` / `tolerance` | The target ΔT (default 30°C) and +/- band (default 5°C) considered "normal" — the AFKØLING circle is green inside that band and fades to red the further outside it the reading sits, in either direction |
| `entities.meter_energy_total` / `meter_volume_total` / `meter_flow` | Billing meter totals |
| `entities.ch_supply` / `ch_return` / `ch_valve` / `ch_outdoor` / `ch_pump` | Central heating (radiator) circuit |
| `entities.dhw_cold_in` / `dhw_hot_out` / `dhw_flow` / `dhw_valve` / `dhw_setpoint` / `dhw_status` | Domestic hot water circuit |
| `entities.circulation_temp` / `circulation_status` / `circulation_bypass_temp` | DHW circulation/recirculation loop |
| `entities.standby` / `vacation` | Switch entities shown as status circles |
| `entities.sentio_active` | Optional: an `input_boolean` (or similar) toggling an external heat-call function. Adds a large circle next to the unit circle, shown only when this is configured |
| `entities.sentio_status` | Optional: a text sensor with the current status, shown on the circle when `sentio_active` is on |
| `entities.sentio_call_active` | Optional: an `input_boolean`/`binary_sensor` marking a call as currently in progress — colors the circle's ring |
| `entities.sentio_fejl` | Optional: a `binary_sensor` marking a fault — colors the circle's ring red |
| `entities.alarms` | List of `binary_sensor` entities aggregated into the unit's alarm ring/count |
| `appearance.flow_animation` | Toggle the animated flow dashes |
| `appearance.show_labels` / `show_temperatures` | Toggle label/temperature text |
| `appearance.compact` | Tighter padding for smaller card slots |
| `temperature_thresholds.*` | Six-stop color scale (white/blue/green/yellow/orange/red) used for every temperature-driven color in the card |

## License

MIT — see [LICENSE](LICENSE).
