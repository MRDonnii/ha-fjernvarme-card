//#region src/fjernvarme-card.ts
var _fvRebuiltCardKeys = /* @__PURE__ */ new Set();
var FjernvarmeCard = class extends HTMLElement {
	static getStubConfig(_hass, entities = []) {
		const entityIds = Array.isArray(entities) ? entities.map((entity) => typeof entity === "string" ? entity : entity?.entity_id).filter(Boolean) : [];
		const findEntity = (patterns, fallback) => entityIds.find((entityId) => patterns.some((pattern) => entityId.includes(pattern))) || fallback;
		return {
			entities: {
				primary_supply: findEntity([
					"fjernvarme_fremlob",
					"fjernvarme_frem",
					"district_heating_supply"
				], void 0),
				primary_return: findEntity(["fjernvarme_retur", "district_heating_return"], void 0),
				primary_cooling: findEntity(["fjernvarme_afkoling", "afkoling"], void 0),
				pressure: findEntity([
					"anlaegstryk",
					"sekundaertryk",
					"pressure"
				], void 0),
				meter_energy_total: findEntity(["total_energy_consumption", "energi_total"], void 0),
				meter_volume_total: findEntity(["total_volume"], void 0),
				meter_flow: findEntity(["volume_flow"], void 0),
				ch_supply: findEntity(["cvv_fremlob"], void 0),
				ch_return: findEntity(["cvv_retur"], void 0),
				ch_valve: findEntity(["cvv_ventilposition"], void 0),
				ch_outdoor: findEntity(["udetemperatur"], void 0),
				ch_pump: findEntity(["heating_pump_status", "pumpe_status"], void 0),
				dhw_cold_in: findEntity(["koldtvandsfoler", "cold_water"], void 0),
				dhw_hot_out: findEntity(["brugsvand_ud", "dhw_out"], void 0),
				dhw_flow: findEntity(["brugsvandsflow"], void 0),
				dhw_valve: findEntity(["ventilposition"], void 0),
				dhw_setpoint: findEntity(["brugsvand_setpunkt"], void 0),
				dhw_status: findEntity(["brugsvand_status"], void 0),
				circulation_temp: findEntity(["circulation_temperature", "cirkulation_temperatur"], void 0),
				circulation_status: findEntity(["cirkulation_status"], void 0),
				circulation_bypass_temp: findEntity(["bypass_temperatur"], void 0),
				standby: findEntity(["standby"], void 0),
				vacation: findEntity(["ferie", "vacation"], void 0),
				alarms: []
			},
			appearance: {
				animation: true,
				flow_animation: true,
				show_labels: true,
				show_temperatures: true,
				compact: false,
				swap_sides: false
			},
			temperature_thresholds: {
				white: 5,
				blue: 20,
				green: 35,
				yellow: 45,
				orange: 55,
				red: 65
			}
		};
	}
	static async getConfigElement() {
		return document.createElement("fjernvarme-card-editor");
	}
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this._config = {};
		this._hass = void 0;
		this._id = `fv-${Math.random().toString(36).slice(2, 10)}`;
		this._lastRenderSignature = "";
		this._animEpoch = Date.now();
		this._resizeObserver = void 0;
	}
	connectedCallback() {
		if (!this._resizeObserver && typeof ResizeObserver !== "undefined") {
			this._resizeObserver = new ResizeObserver(() => this._requestRebuildIfNeeded());
			this._resizeObserver.observe(this);
		}
	}
	disconnectedCallback() {
		this._resizeObserver?.disconnect();
		this._resizeObserver = void 0;
	}
	_cardIdentityKey() {
		try {
			return JSON.stringify(this._config?.entities || {});
		} catch {
			return "";
		}
	}
	_requestRebuildIfNeeded() {
		const key = this._cardIdentityKey();
		if (!key || _fvRebuiltCardKeys.has(key)) return;
		_fvRebuiltCardKeys.add(key);
		this.dispatchEvent(new CustomEvent("ll-rebuild", {
			bubbles: true,
			composed: true
		}));
	}
	_phaseDelay(durationSeconds, offsetSeconds = 0) {
		if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return "0s";
		return `${(-((((Date.now() - this._animEpoch) / 1e3 + offsetSeconds) % durationSeconds + durationSeconds) % durationSeconds)).toFixed(3)}s`;
	}
	setConfig(config) {
		if (!config) throw new Error("Invalid configuration");
		this._config = {
			entities: {},
			appearance: {
				animation: true,
				flow_animation: true,
				show_labels: true,
				show_temperatures: true,
				compact: false
			},
			...config,
			entities: {
				alarms: [],
				...config.entities || {}
			},
			temperature_thresholds: {
				white: 5,
				blue: 20,
				green: 35,
				yellow: 45,
				orange: 55,
				red: 65,
				...config.temperature_thresholds || {}
			},
			appearance: {
				animation: true,
				flow_animation: true,
				show_labels: true,
				show_temperatures: true,
				compact: false,
				...config.appearance || {}
			}
		};
		this._lastRenderSignature = "";
		this._render();
	}
	set hass(hass) {
		this._hass = hass;
		if (this._renderSignature() === this._lastRenderSignature) return;
		this._render();
	}
	getCardSize() {
		const measuredHeight = (this.shadowRoot?.querySelector("ha-card"))?.getBoundingClientRect?.().height;
		const height = Number.isFinite(measuredHeight) && measuredHeight > 0 ? measuredHeight : this._cardHeightForWidth(this._currentCardWidth());
		return Math.max(1, Math.ceil((height + 12) / 50));
	}
	getGridOptions() {
		return {
			rows: "auto",
			columns: 12,
			min_columns: 6
		};
	}
	_currentCardWidth() {
		const card = this.shadowRoot?.querySelector("ha-card");
		return this.getBoundingClientRect?.().width || card?.getBoundingClientRect?.().width || this.parentElement?.getBoundingClientRect?.().width || 0;
	}
	_diagramHeight() {
		return 532;
	}
	_cardHeightForWidth(width) {
		const compact = this._config?.appearance?.compact === true;
		return (compact ? 10 : 18) + Math.max(0, (Number.isFinite(width) && width > 0 ? width : compact ? 360 : 500) - (compact ? 6 : 10)) * (this._diagramHeight() / 620);
	}
	_renderSignature() {
		const entityKeys = [
			"primary_supply",
			"primary_return",
			"primary_cooling",
			"pressure",
			"meter_energy_total",
			"meter_volume_total",
			"meter_flow",
			"ch_supply",
			"ch_return",
			"ch_valve",
			"ch_outdoor",
			"ch_pump",
			"dhw_cold_in",
			"dhw_hot_out",
			"dhw_flow",
			"dhw_valve",
			"dhw_setpoint",
			"dhw_status",
			"circulation_temp",
			"circulation_status",
			"circulation_bypass_temp",
			"standby",
			"vacation"
		];
		const appearance = this._config?.appearance || {};
		const entities = this._config?.entities || {};
		const alarms = Array.isArray(entities.alarms) ? entities.alarms : [];
		const stateParts = entityKeys.map((key) => {
			const entityId = entities[key] || "";
			const entity = entityId && this._hass ? this._hass.states[entityId] : void 0;
			return [
				key,
				entityId,
				entity?.state ?? "",
				entity?.attributes?.unit_of_measurement ?? ""
			].join(":");
		});
		const alarmParts = alarms.map((entityId) => {
			return `${entityId}:${(entityId && this._hass ? this._hass.states[entityId] : void 0)?.state ?? ""}`;
		});
		return JSON.stringify({
			appearance,
			language: this._language(),
			temperatureThresholds: this._config?.temperature_thresholds || {},
			states: stateParts,
			alarms: alarmParts
		});
	}
	_entityId(key) {
		return this._config?.entities?.[key];
	}
	_entity(key) {
		const entityId = this._entityId(key);
		return entityId && this._hass ? this._hass.states[entityId] : void 0;
	}
	_state(key) {
		const entity = this._entity(key);
		if (!entity || entity.state === "unknown" || entity.state === "unavailable") return;
		return entity.state;
	}
	_number(key) {
		const value = Number.parseFloat(String(this._state(key)).replace(",", "."));
		return Number.isFinite(value) ? value : void 0;
	}
	_unit(key, fallback = "") {
		return this._entity(key)?.attributes?.unit_of_measurement || fallback;
	}
	_escapeHtml(value) {
		return value?.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;") || "";
	}
	_svgEntityAttrs(entityKey, extraClass = "") {
		const entityId = this._entityId(entityKey);
		const className = ["entity-hit", extraClass].filter(Boolean).join(" ");
		return entityId ? `class="${className}" data-entity="${entityId}"` : extraClass ? `class="${extraClass}"` : "";
	}
	_fireMoreInfo(entityId) {
		this.dispatchEvent(new CustomEvent("hass-more-info", {
			detail: { entityId },
			bubbles: true,
			composed: true
		}));
	}
	_formatTemp(key) {
		const value = this._number(key);
		if (value === void 0) return "—";
		return `${value.toFixed(1)}${this._unit(key, "°C")}`;
	}
	_formatNumber(key, decimals = 0, suffix = "") {
		const value = this._number(key);
		if (value === void 0) return "—";
		return `${value.toFixed(decimals)}${suffix}`;
	}
	_formatWithUnit(key, decimals = 1, fallbackUnit = "") {
		const value = this._number(key);
		if (value === void 0) return "—";
		return `${value.toFixed(decimals)} ${this._unit(key, fallbackUnit)}`;
	}
	_formatDisplayState(key) {
		const entity = this._entity(key);
		if (!entity || entity.state === "unknown" || entity.state === "unavailable") return "—";
		return this._humanizeState(entity.state);
	}
	_humanizeState(state) {
		return state.toString().replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
	}
	_isOn(key) {
		const state = this._state(key);
		return state !== void 0 && [
			"on",
			"true",
			"1",
			"open",
			"åben",
			"aaben"
		].includes(state.toString().trim().toLowerCase());
	}
	_language() {
		return (this._hass?.locale?.language || this._hass?.language || "en").toString().toLowerCase().startsWith("da") ? "da" : "en";
	}
	_t(key) {
		const translations = {
			en: {
				primary_supply: "Supply",
				primary_return: "Return",
				ch_return: "CH Return",
				ch_supply: "CH Supply",
				dhw_cold_in: "Cold",
				dhw_hot_out: "Hot",
				circulation_bypass_temp: "Bypass",
				circulation_temp: "Circ.",
				cooling: "Cooling",
				pressure: "Pressure",
				unit: "Unit",
				alarms: "Alarms",
				standby: "Standby",
				vacation: "Vacation",
				pump: "Pump",
				outdoor: "Outdoor",
				ok: "OK",
				fault: "Alarm",
				off: "Off",
				on: "On",
				meter_summary: "Meter"
			},
			da: {
				primary_supply: "FJF",
				primary_return: "FJR",
				ch_return: "CVV Retur",
				ch_supply: "CVV Frem",
				dhw_cold_in: "KV",
				dhw_hot_out: "BV",
				circulation_bypass_temp: "Bypass",
				circulation_temp: "Cirk.",
				cooling: "Afkøling",
				pressure: "Tryk",
				unit: "Enhed",
				alarms: "Alarmer",
				standby: "Standby",
				vacation: "Ferie",
				pump: "Pumpe",
				outdoor: "Ude",
				ok: "OK",
				fault: "Alarm",
				off: "Fra",
				on: "Til",
				meter_summary: "Måler"
			}
		};
		return translations[this._language()]?.[key] || translations.en[key] || key;
	}
	_temperatureThresholds() {
		const configured = this._config?.temperature_thresholds || {};
		return Object.fromEntries(Object.entries({
			white: 5,
			blue: 20,
			green: 35,
			yellow: 45,
			orange: 55,
			red: 65
		}).map(([key, fallback]) => {
			const value = Number.parseFloat(configured[key]);
			return [key, Number.isFinite(value) ? value : fallback];
		}));
	}
	_temperatureChannels(value) {
		if (!Number.isFinite(value)) return [
			136,
			144,
			153
		];
		const thresholds = this._temperatureThresholds();
		const stops = [
			{
				value: thresholds.white,
				color: [
					248,
					252,
					255
				]
			},
			{
				value: thresholds.blue,
				color: [
					47,
					128,
					237
				]
			},
			{
				value: thresholds.green,
				color: [
					67,
					160,
					71
				]
			},
			{
				value: thresholds.yellow,
				color: [
					244,
					208,
					63
				]
			},
			{
				value: thresholds.orange,
				color: [
					242,
					153,
					74
				]
			},
			{
				value: thresholds.red,
				color: [
					219,
					68,
					55
				]
			}
		].sort((a, b) => a.value - b.value);
		if (value <= stops[0].value) return stops[0].color;
		if (value >= stops[stops.length - 1].value) return stops[stops.length - 1].color;
		for (let index = 0; index < stops.length - 1; index += 1) {
			const from = stops[index];
			const to = stops[index + 1];
			if (value >= from.value && value <= to.value) {
				const span = Math.max(.1, to.value - from.value);
				const ratio = (value - from.value) / span;
				return from.color.map((channel, channelIndex) => Math.round(channel + (to.color[channelIndex] - channel) * ratio));
			}
		}
		return stops[2].color;
	}
	_rgb(channels) {
		return `rgb(${channels.join(", ")})`;
	}
	_temperatureColor(value) {
		if (!Number.isFinite(value)) return "var(--secondary-text-color, currentColor)";
		return this._rgb(this._temperatureChannels(value));
	}
	_gradient(id, from, to, x1 = "0%", x2 = "100%", y = "0", gradientUnits = "") {
		const fromValue = Number.isFinite(Number(from)) ? Number(from) : Number(to);
		const toValue = Number.isFinite(Number(to)) ? Number(to) : Number(from);
		const midValue = Number.isFinite(fromValue) && Number.isFinite(toValue) ? (fromValue + toValue) / 2 : void 0;
		return `
      <linearGradient id="${id}" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"${gradientUnits ? ` gradientUnits="${gradientUnits}"` : ""}>
        <stop offset="0%" stop-color="${this._temperatureColor(fromValue)}"></stop>
        <stop offset="52%" stop-color="${this._temperatureColor(midValue)}"></stop>
        <stop offset="100%" stop-color="${this._temperatureColor(toValue)}"></stop>
      </linearGradient>
    `;
	}
	_flowAnimationEnabled() {
		const appearance = this._config?.appearance || {};
		return (appearance.flow_animation ?? appearance.animation) !== false;
	}
	_laneFlowState(signalKeys) {
		if (!this._flowAnimationEnabled()) return {
			duration: "0s",
			stopped: true
		};
		let hasSignal = false;
		let anyActive = false;
		for (const key of signalKeys) {
			if (!this._entityId(key)) continue;
			const value = this._number(key);
			if (Number.isFinite(value)) {
				hasSignal = true;
				if (value > 0) anyActive = true;
				continue;
			}
			if (this._state(key) !== void 0) {
				hasSignal = true;
				if (this._isOn(key)) anyActive = true;
			}
		}
		if (!hasSignal) return {
			duration: "3.4s",
			stopped: false
		};
		return anyActive ? {
			duration: "3.4s",
			stopped: false
		} : {
			duration: "0s",
			stopped: true
		};
	}
	_airLines(path, duration, stopped) {
		const variants = [
			{
				offset: -8,
				width: 2.4,
				alpha: .8,
				dash: 22,
				gap: 90,
				flowDelay: -.2,
				waveDelay: -.7,
				wave: 2.4
			},
			{
				offset: 0,
				width: 2,
				alpha: .7,
				dash: 16,
				gap: 70,
				flowDelay: -1.2,
				waveDelay: -1.8,
				wave: 2.8
			},
			{
				offset: 8,
				width: 2.2,
				alpha: .75,
				dash: 20,
				gap: 100,
				flowDelay: -1.9,
				waveDelay: -1.1,
				wave: 2.6
			}
		];
		const durationSeconds = Number.parseFloat(duration);
		return variants.map((variant) => `
              <g class="fv-air-band ${stopped ? "stopped" : ""}" style="--air-wave:${variant.wave}px; animation-delay:${this._phaseDelay(9.4, variant.waveDelay)};">
                <path
                  class="fv-air-line ${stopped ? "stopped" : ""}"
                  style="--flow-duration:${duration}; --air-alpha:${variant.alpha}; --air-flow-delay:${this._phaseDelay(durationSeconds, variant.flowDelay)};"
                  stroke-width="${variant.width}"
                  stroke-dasharray="${variant.dash} ${variant.gap}"
                  transform="translate(0 ${variant.offset})"
                  d="${path}"
                ></path>
              </g>`).join("");
	}
	_statusCircle(entityKey, label, value, x, y, valueClass = "", large = false, ring = void 0, valueFontSizeOverride = void 0, requireEntity = true, bgColor = void 0) {
		if (requireEntity && !this._entityId(entityKey)) return "";
		const textClass = ["status-value", valueClass].filter(Boolean).join(" ");
		const r = large ? 50 : 42;
		const ringR = large ? 46 : 38;
		const circleClass = large ? "status-circle status-circle-large" : "status-circle";
		const rimClass = large ? "status-circle-rim status-circle-rim-large" : "status-circle-rim";
		const glossCx = large ? -14 : -12;
		const glossCy = large ? -21 : -19;
		const glossRx = large ? 25 : 21;
		const glossRy = large ? 15 : 13;
		const labelY = large ? -10 : -8;
		const valueY = large ? 19 : 18;
		const valueFontSize = valueFontSizeOverride || (large ? "19px" : "16px");
		const bgStyle = bgColor ? ` style="fill:${bgColor};"` : "";
		return `
            <g ${this._svgEntityAttrs(entityKey)} tabindex="0" transform="translate(${x} ${y})">
              <circle class="${circleClass}" cx="0" cy="0" r="${r}"${bgStyle}></circle>
              <ellipse class="status-circle-gloss" cx="${glossCx}" cy="${glossCy}" rx="${glossRx}" ry="${glossRy}"></ellipse>
              ${ring ? `
                <circle class="status-ring-bg" cx="0" cy="0" r="${ringR}"></circle>
                <circle class="status-ring ${ring.colorClass || ""}" cx="0" cy="0" r="${ringR}" pathLength="100" stroke-dasharray="${ring.progress} 100" transform="rotate(-90 0 0)"${ring.color ? ` style="stroke:${ring.color} !important;"` : ""}></circle>
              ` : ""}
              <circle class="${rimClass}" cx="0" cy="0" r="${r}"></circle>
              <text x="0" y="${labelY}" text-anchor="middle" class="status-label">${this._escapeHtml(label)}</text>
              <text x="0" y="${valueY}" text-anchor="middle" class="${textClass}" style="font-size:${valueFontSize};">${this._escapeHtml(value)}</text>
            </g>
    `;
	}
	_laneBadgeSvg(key, x, y, iconType, valueText, bgColor = void 0) {
		if (!this._entityId(key)) return "";
		const icons = {
			exchanger: `<path class="badge-icon-stroke" d="M-9 -7 L-3 6 L3 -6 L9 7" fill="none"></path>`,
			radiator: `
        <rect x="-10" y="-6" width="20" height="12" rx="1.5" class="badge-icon-fill"></rect>
        <line x1="-7" y1="-4" x2="-7" y2="4" class="badge-icon-line"></line>
        <line x1="-3.5" y1="-4" x2="-3.5" y2="4" class="badge-icon-line"></line>
        <line x1="0" y1="-4" x2="0" y2="4" class="badge-icon-line"></line>
        <line x1="3.5" y1="-4" x2="3.5" y2="4" class="badge-icon-line"></line>
        <line x1="7" y1="-4" x2="7" y2="4" class="badge-icon-line"></line>
        <line x1="-7" y1="6" x2="-7" y2="8.5" class="badge-icon-stroke"></line>
        <line x1="7" y1="6" x2="7" y2="8.5" class="badge-icon-stroke"></line>
      `,
			droplet: `<path class="badge-icon-fill" d="M0 -9 C5 -2 5.5 6 0 8.5 C-5.5 6 -5 -2 0 -9 Z"></path>`,
			pump: `
        <path class="badge-icon-stroke" d="M-7 -2 A7 7 0 1 1 -6 4" fill="none"></path>
        <path class="badge-icon-fill" d="M-9 3 L-4 7 L-3 0 Z"></path>
      `
		};
		const bgStyle = bgColor ? ` style="fill:${bgColor}; fill-opacity:.85;"` : "";
		return `
            <g ${this._svgEntityAttrs(key)} tabindex="0" transform="translate(${x} ${y})">
              <rect x="-24" y="-27" width="48" height="54" rx="9" class="badge-box"${bgStyle}></rect>
              <g transform="translate(0 -9)">${icons[iconType] || ""}</g>
              <text x="0" y="19" text-anchor="middle" class="badge-value">${this._escapeHtml(valueText)}</text>
            </g>
    `;
	}
	_lanePipe(id, x1, x2, y, fromKey, toKey, duration, stopped) {
		const path = `M${x1} ${y} H${x2}`;
		const fromValue = this._number(fromKey);
		const toValue = this._number(toKey);
		const stoppedClass = stopped ? " stopped" : "";
		const fadeGradientId = `${id}-fade-gradient`;
		const maskId = `${id}-fade-mask`;
		return {
			gradient: `
        ${this._gradient(id, fromValue, toValue, x1, x2, y, "userSpaceOnUse")}
        <linearGradient id="${fadeGradientId}" x1="${x1}" y1="0" x2="${x2}" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="black"></stop>
          <stop offset="10%" stop-color="white"></stop>
          <stop offset="90%" stop-color="white"></stop>
          <stop offset="100%" stop-color="black"></stop>
        </linearGradient>
        <mask id="${maskId}" maskUnits="userSpaceOnUse" x="${x1 - 10}" y="${y - 40}" width="${x2 - x1 + 20}" height="80">
          <rect x="${x1 - 10}" y="${y - 40}" width="${x2 - x1 + 20}" height="80" fill="url(#${fadeGradientId})"></rect>
        </mask>
      `,
			markup: `
              <g mask="url(#${maskId})">
                <path class="duct-bg" d="${path}"></path>
                <path class="flow-glow${stoppedClass}" stroke="url(#${id})" d="${path}"></path>
                <path class="flow${stoppedClass}" stroke="url(#${id})" d="${path}"></path>
                ${this._airLines(path, duration, stopped)}
              </g>
      `
		};
	}
	_pressureRing() {
		const value = this._number("pressure");
		if (!this._entityId("pressure") || !Number.isFinite(value)) return void 0;
		if (value < .5) return {
			progress: 100,
			colorClass: "danger"
		};
		if (value < .8) return {
			progress: 100,
			colorClass: "warn"
		};
		return {
			progress: 100,
			colorClass: ""
		};
	}
	_alarmEntityIds() {
		const alarms = this._config?.entities?.alarms;
		return Array.isArray(alarms) ? alarms.filter(Boolean) : [];
	}
	_activeAlarmCount() {
		const ids = this._alarmEntityIds();
		if (!this._hass) return 0;
		return ids.filter((entityId) => {
			const state = this._hass.states[entityId]?.state;
			return state === "on" || state === "problem";
		}).length;
	}
	_overallRing() {
		const alarmCount = this._activeAlarmCount();
		const pressure = this._number("pressure");
		if (alarmCount > 0) return {
			progress: 100,
			colorClass: "danger"
		};
		if (Number.isFinite(pressure) && pressure < .5) return {
			progress: 100,
			colorClass: "danger"
		};
		if (Number.isFinite(pressure) && pressure < .8) return {
			progress: 100,
			colorClass: "warn"
		};
		return {
			progress: 100,
			colorClass: ""
		};
	}
	_overallStatusText() {
		const alarmCount = this._activeAlarmCount();
		if (alarmCount > 0) return this._alarmEntityIds().length === 1 ? this._t("fault") : `${alarmCount} ${this._t("fault")}`;
		if (this._isOn("standby")) return this._t("standby");
		return this._t("ok");
	}
	_onOffRing(key, invert = false) {
		if (!this._entityId(key)) return void 0;
		const on = this._isOn(key);
		return {
			progress: 100,
			colorClass: (invert ? !on : on) ? "info" : ""
		};
	}
	_numericActivityRing(key, threshold = 0) {
		if (!this._entityId(key)) return void 0;
		const value = this._number(key);
		if (!Number.isFinite(value)) return void 0;
		return {
			progress: 100,
			colorClass: value > threshold ? "info" : ""
		};
	}
	_temperatureRing(key) {
		if (!this._entityId(key)) return void 0;
		const value = this._number(key);
		if (!Number.isFinite(value)) return void 0;
		return {
			progress: 100,
			color: this._temperatureColor(value)
		};
	}
	_coolingBackgroundColor(key, low = 0, high = 30) {
		const value = this._number(key);
		if (!Number.isFinite(value)) return void 0;
		const ratio = Math.max(0, Math.min(1, (value - low) / Math.max(.1, high - low)));
		const red = [
			176,
			58,
			58
		];
		const blue = [
			47,
			108,
			190
		];
		return `rgb(${red.map((channel, index) => Math.round(channel + (blue[index] - channel) * ratio)).join(", ")})`;
	}
	_render() {
		if (!this.shadowRoot || !this._config) return;
		this._lastRenderSignature = this._renderSignature();
		const compact = this._config.appearance.compact === true;
		const hasLabels = this._config.appearance.show_labels !== false;
		const hasTemps = this._config.appearance.show_temperatures !== false;
		const animationOff = !this._flowAnimationEnabled();
		const centerX = 310;
		const gPrimary = `${this._id}-primary`;
		const gCh = `${this._id}-ch`;
		const gDhw = `${this._id}-dhw`;
		const gCirc = `${this._id}-circ`;
		const laneY1 = 154;
		const laneY2 = 234;
		const laneY3 = 314;
		const laneY4 = 394;
		const topRowY = 56;
		const bottomRowY = 482;
		const primaryFlow = this._laneFlowState(["meter_flow"]);
		const chFlow = this._laneFlowState(["ch_valve"]);
		const dhwFlow = this._laneFlowState(["dhw_flow", "dhw_valve"]);
		const circFlow = this._laneFlowState(["circulation_status"]);
		const swapSides = this._config?.appearance?.swap_sides === true;
		const sides = (leftKey, leftLabel, rightKey, rightLabel) => swapSides ? {
			leftKey: rightKey,
			leftLabel: rightLabel,
			rightKey: leftKey,
			rightLabel: leftLabel
		} : {
			leftKey,
			leftLabel,
			rightKey,
			rightLabel
		};
		const primarySides = sides("primary_return", this._t("primary_return"), "primary_supply", this._t("primary_supply"));
		const chSides = sides("ch_return", this._t("ch_return"), "ch_supply", this._t("ch_supply"));
		const dhwSides = sides("dhw_cold_in", this._t("dhw_cold_in"), "dhw_hot_out", this._t("dhw_hot_out"));
		const circSides = sides("circulation_bypass_temp", this._t("circulation_bypass_temp"), "circulation_temp", this._t("circulation_temp"));
		const primaryLane = this._lanePipe(gPrimary, 110, 510, laneY1, primarySides.leftKey, primarySides.rightKey, primaryFlow.duration, primaryFlow.stopped);
		const chLane = this._lanePipe(gCh, 110, 510, laneY2, chSides.leftKey, chSides.rightKey, chFlow.duration, chFlow.stopped);
		const dhwLane = this._lanePipe(gDhw, 110, 510, laneY3, dhwSides.leftKey, dhwSides.rightKey, dhwFlow.duration, dhwFlow.stopped);
		const circLane = this._lanePipe(gCirc, 110, 510, laneY4, circSides.leftKey, circSides.rightKey, circFlow.duration, circFlow.stopped);
		const laneBox = (key, label, x, y, align) => {
			if (!this._entityId(key)) return "";
			const textX = align === "left" ? x + 50 : x + 50;
			return `
            <g ${this._svgEntityAttrs(key)} tabindex="0">
              <rect x="${x}" y="${y - 28}" width="100" height="56" rx="10" fill="transparent"></rect>
              ${hasLabels ? `<text x="${textX}" y="${y - 8}" text-anchor="middle" class="label">${this._escapeHtml(label)}</text>` : ""}
              ${hasTemps ? `<text x="${textX}" y="${y + 18}" text-anchor="middle" class="temperature">${this._formatTemp(key)}</text>` : ""}
            </g>
      `;
		};
		this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          box-sizing: border-box;
          --fv-flow-width: 40px;
          --fv-background: var(--fv-card-background, var(--ha-card-background, var(--card-background-color, var(--paper-card-background-color, var(--primary-background-color, #1c1c1c)))));
          --fv-text: var(--fv-card-text-color, var(--primary-text-color, var(--text-primary-color, currentColor)));
          --fv-muted: var(--fv-card-secondary-text-color, var(--secondary-text-color, var(--fv-text)));
          --fv-flow-detail: var(--fv-card-flow-detail-color, rgba(255, 255, 255, .96));
        }

        ha-card {
          display: block;
          box-sizing: border-box;
          width: 100%;
          overflow: hidden;
          position: relative;
        }

        .card {
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          padding: ${compact ? "4px 3px 6px" : "8px 5px 10px"};
          color: var(--fv-text) !important;
        }

        svg {
          width: 100%;
          height: auto;
          aspect-ratio: 620 / ${this._diagramHeight()};
          display: block;
          overflow: visible;
          color: var(--fv-text) !important;
        }

        svg text {
          fill: var(--fv-text) !important;
          color: var(--fv-text) !important;
        }

        .duct-bg {
          fill: none;
          stroke: color-mix(in srgb, var(--fv-text) 22%, transparent);
          stroke-width: calc(var(--fv-flow-width) + 14px);
          stroke-linecap: butt;
          stroke-linejoin: round;
        }

        .flow {
          fill: none;
          stroke-width: var(--fv-flow-width);
          stroke-linecap: butt;
          stroke-linejoin: round;
          opacity: .7;
        }

        .flow-glow {
          fill: none;
          stroke-width: calc(var(--fv-flow-width) + 6px);
          stroke-linecap: butt;
          stroke-linejoin: round;
          opacity: .12;
        }

        .flow.stopped,
        .flow-glow.stopped {
          stroke: color-mix(in srgb, var(--fv-text) 26%, transparent) !important;
          transition: stroke .5s ease;
        }

        .flow.stopped {
          opacity: .55;
        }

        .flow-glow.stopped {
          opacity: 0;
        }

        .fv-air-band {
          transform-box: fill-box;
          transform-origin: center;
        }

        .fv-air-line {
          fill: none;
          stroke: var(--fv-flow-detail);
          stroke-linecap: round;
          opacity: var(--air-alpha, .72);
          animation: fv-airflow var(--flow-duration, 3.4s) linear infinite;
          animation-delay: var(--air-flow-delay, 0s);
        }

        .no-animation .fv-air-line {
          animation: none;
        }

        .fv-air-line.stopped {
          animation: none;
          opacity: .16;
        }

        @keyframes fv-airflow {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -260; }
        }

        .label {
          font-size: 13px;
          fill: var(--fv-muted) !important;
          color: var(--fv-muted) !important;
        }

        .temperature {
          font-size: 20px;
          font-weight: 600;
          fill: var(--fv-text) !important;
          color: var(--fv-text) !important;
        }

        .status-circle {
          fill: color-mix(in srgb, var(--fv-background) 88%, var(--fv-text) 4%);
          stroke: none;
          filter: drop-shadow(0 3px 7px rgba(0, 0, 0, .3));
        }

        .status-circle-rim {
          fill: none;
          stroke: color-mix(in srgb, var(--fv-text) 24%, transparent);
          stroke-width: 1.5;
        }

        .status-circle-rim-large {
          stroke-width: 2;
        }

        .status-circle-gloss {
          fill: white;
          opacity: .1;
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        .status-label {
          font-size: 11px;
          letter-spacing: .3px;
          text-transform: uppercase;
          fill: var(--fv-muted) !important;
          color: var(--fv-muted) !important;
          paint-order: stroke;
          stroke: color-mix(in srgb, var(--fv-background) 65%, transparent);
          stroke-width: 2.5px;
        }

        .status-value {
          font-size: 14px;
          font-weight: 700;
          fill: var(--fv-text) !important;
          color: var(--fv-text) !important;
        }

        .status-ring-bg {
          fill: none;
          stroke: color-mix(in srgb, var(--fv-text) 18%, transparent);
          stroke-width: 3;
        }

        .status-ring {
          fill: none;
          stroke: color-mix(in srgb, var(--success-color, #43e683) 82%, var(--fv-text) 18%);
          stroke-width: 3;
          stroke-linecap: round;
          transition: stroke .4s ease;
        }

        .status-ring.warn {
          stroke: color-mix(in srgb, var(--warning-color, #f2994a) 82%, var(--fv-text) 18%);
        }

        .status-ring.danger {
          stroke: color-mix(in srgb, var(--error-color, #db4437) 82%, var(--fv-text) 18%);
        }

        .status-ring.info {
          stroke: color-mix(in srgb, var(--info-color, #4aa3ff) 82%, var(--fv-text) 18%);
        }

        .badge-box {
          fill: #808080;
          fill-opacity: .6;
          stroke: color-mix(in srgb, var(--fv-text) 35%, transparent);
          stroke-width: 1.5;
        }

        .badge-icon-stroke {
          stroke: var(--fv-text);
          stroke-width: 2.4;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .badge-icon-fill {
          fill: color-mix(in srgb, var(--fv-text) 65%, transparent);
        }

        .badge-icon-line {
          stroke: var(--fv-background);
          stroke-width: 1.6;
          stroke-linecap: round;
        }

        .badge-value {
          font-size: 10px;
          font-weight: 750;
          fill: var(--fv-text) !important;
          paint-order: stroke;
          stroke: color-mix(in srgb, var(--fv-background) 85%, transparent);
          stroke-width: 3px;
        }

        .entity-hit {
          cursor: pointer;
        }

        .entity-hit:focus-visible {
          outline: 2px solid var(--fv-text);
          outline-offset: 3px;
        }
      </style>

      <ha-card>
        <div class="card ${animationOff ? "no-animation" : ""}">
          <svg viewBox="0 0 620 ${this._diagramHeight()}" role="img" aria-label="${this._t("unit")}">
            <defs>
              ${primaryLane.gradient}
              ${chLane.gradient}
              ${dhwLane.gradient}
              ${circLane.gradient}
            </defs>

            ${this._statusCircle("primary_cooling", this._t("cooling"), this._formatWithUnit("primary_cooling", 1, ""), 160, topRowY, "", false, this._numericActivityRing("primary_cooling", .5), void 0, true, this._coolingBackgroundColor("primary_cooling"))}
            ${this._statusCircle("standby", this._t("unit"), this._overallStatusText(), centerX, topRowY, "", true, this._overallRing(), void 0, false)}
            ${this._statusCircle("pressure", this._t("pressure"), this._formatNumber("pressure", 2), 460, topRowY, "", false, this._pressureRing())}

            ${laneBox(primarySides.leftKey, primarySides.leftLabel, 5, laneY1, "left")}
            ${laneBox(primarySides.rightKey, primarySides.rightLabel, 515, laneY1, "right")}
            ${primaryLane.markup}
            ${this._laneBadgeSvg("primary_cooling", 310, laneY1, "exchanger", this._formatWithUnit("primary_cooling", 1, ""), this._coolingBackgroundColor("primary_cooling"))}

            ${laneBox(chSides.leftKey, chSides.leftLabel, 5, laneY2, "left")}
            ${laneBox(chSides.rightKey, chSides.rightLabel, 515, laneY2, "right")}
            ${chLane.markup}
            ${this._laneBadgeSvg("ch_valve", 310, laneY2, "radiator", this._formatNumber("ch_valve", 0, "%"))}

            ${laneBox(dhwSides.leftKey, dhwSides.leftLabel, 5, laneY3, "left")}
            ${laneBox(dhwSides.rightKey, dhwSides.rightLabel, 515, laneY3, "right")}
            ${dhwLane.markup}
            ${this._laneBadgeSvg("dhw_flow", 310, laneY3, "droplet", this._formatWithUnit("dhw_flow", 0, ""))}

            ${laneBox(circSides.leftKey, circSides.leftLabel, 5, laneY4, "left")}
            ${laneBox(circSides.rightKey, circSides.rightLabel, 515, laneY4, "right")}
            ${circLane.markup}
            ${this._laneBadgeSvg("circulation_status", 310, laneY4, "pump", this._isOn("circulation_status") ? this._t("on") : this._t("off"))}

            ${this._statusCircle("standby", this._t("standby"), this._isOn("standby") ? this._t("on") : this._t("off"), 130, bottomRowY, "", false, this._onOffRing("standby"))}
            ${this._statusCircle("vacation", this._t("vacation"), this._isOn("vacation") ? this._t("on") : this._t("off"), 250, bottomRowY, "", false, this._onOffRing("vacation"))}
            ${this._statusCircle("ch_pump", this._t("pump"), this._formatDisplayState("ch_pump"), 370, bottomRowY, "", false, this._onOffRing("ch_pump"))}
            ${this._statusCircle("ch_outdoor", this._t("outdoor"), this._formatTemp("ch_outdoor"), 490, bottomRowY, "", false, this._temperatureRing("ch_outdoor"), "16px")}
          </svg>
        </div>
      </ha-card>
    `;
		this.shadowRoot.querySelectorAll("[data-entity]").forEach((element) => {
			element.addEventListener("click", () => this._fireMoreInfo(element.dataset.entity));
			element.addEventListener("keydown", (event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					this._fireMoreInfo(element.dataset.entity);
				}
			});
		});
	}
};
var FjernvarmeCardEditor = class extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this._config = {};
		this._schemaCache = void 0;
	}
	setConfig(config) {
		this._config = config || {};
		this._render();
	}
	set hass(hass) {
		this._hass = hass;
		this._render();
	}
	_formData() {
		const entities = this._config?.entities || {};
		const appearance = this._config?.appearance || {};
		const thresholds = this._config?.temperature_thresholds || {};
		return {
			primary_supply: entities.primary_supply,
			primary_return: entities.primary_return,
			primary_cooling: entities.primary_cooling,
			pressure: entities.pressure,
			meter_energy_total: entities.meter_energy_total,
			meter_volume_total: entities.meter_volume_total,
			meter_flow: entities.meter_flow,
			ch_supply: entities.ch_supply,
			ch_return: entities.ch_return,
			ch_valve: entities.ch_valve,
			ch_outdoor: entities.ch_outdoor,
			ch_pump: entities.ch_pump,
			dhw_cold_in: entities.dhw_cold_in,
			dhw_hot_out: entities.dhw_hot_out,
			dhw_flow: entities.dhw_flow,
			dhw_valve: entities.dhw_valve,
			dhw_setpoint: entities.dhw_setpoint,
			dhw_status: entities.dhw_status,
			circulation_temp: entities.circulation_temp,
			circulation_status: entities.circulation_status,
			circulation_bypass_temp: entities.circulation_bypass_temp,
			standby: entities.standby,
			vacation: entities.vacation,
			alarms: entities.alarms || [],
			animation: appearance.animation !== false,
			flow_animation: (appearance.flow_animation ?? appearance.animation) !== false,
			show_labels: appearance.show_labels !== false,
			show_temperatures: appearance.show_temperatures !== false,
			compact: appearance.compact === true,
			swap_sides: appearance.swap_sides === true,
			threshold_white: thresholds.white ?? 5,
			threshold_blue: thresholds.blue ?? 20,
			threshold_green: thresholds.green ?? 35,
			threshold_yellow: thresholds.yellow ?? 45,
			threshold_orange: thresholds.orange ?? 55,
			threshold_red: thresholds.red ?? 65
		};
	}
	_language() {
		return (this._hass?.locale?.language || this._hass?.language || "en").toString().toLowerCase().startsWith("da") ? "da" : "en";
	}
	_t(key) {
		const translations = {
			en: {
				primary: "District heating (primary)",
				primary_supply: "Primary supply (FJF)",
				primary_return: "Primary return (FJR)",
				primary_cooling: "Cooling / ΔT",
				pressure: "System pressure",
				meter: "Billing meter",
				meter_energy_total: "Total energy",
				meter_volume_total: "Total volume",
				meter_flow: "Current flow",
				ch: "Central heating (radiators)",
				ch_supply: "Radiator supply (CVV frem)",
				ch_return: "Radiator return (CVV retur)",
				ch_valve: "Radiator valve position",
				ch_outdoor: "Outdoor temperature",
				ch_pump: "Heating pump status",
				dhw: "Domestic hot water",
				dhw_cold_in: "Cold water in (KV)",
				dhw_hot_out: "Hot water out (BV)",
				dhw_flow: "DHW flow",
				dhw_valve: "DHW valve position",
				dhw_setpoint: "DHW setpoint",
				dhw_status: "DHW status",
				circulation: "DHW circulation loop",
				circulation_temp: "Circulation return temperature",
				circulation_status: "Circulation pump status",
				circulation_bypass_temp: "Circulation bypass temperature",
				controls: "Controls & alarms",
				standby: "Standby switch",
				vacation: "Vacation switch",
				alarms: "Alarm / fault entities",
				appearance: "Appearance",
				animation: "Animation",
				flow_animation: "Flow animation",
				show_labels: "Show labels",
				show_temperatures: "Show temperatures",
				compact: "Compact",
				swap_sides: "Swap left/right (supply ↔ return)",
				temperature_colors: "Temperature colors",
				threshold_white: "White from",
				threshold_blue: "Blue from",
				threshold_green: "Green from",
				threshold_yellow: "Yellow from",
				threshold_orange: "Orange from",
				threshold_red: "Red from"
			},
			da: {
				primary: "Fjernvarme (primær)",
				primary_supply: "Fjernvarme frem (FJF)",
				primary_return: "Fjernvarme retur (FJR)",
				primary_cooling: "Afkøling / ΔT",
				pressure: "Anlægstryk",
				meter: "Afregningsmåler",
				meter_energy_total: "Total energi",
				meter_volume_total: "Total volumen",
				meter_flow: "Aktuel flow",
				ch: "Centralvarme (radiatorer)",
				ch_supply: "Radiator frem (CVV frem)",
				ch_return: "Radiator retur (CVV retur)",
				ch_valve: "Radiatorventil position",
				ch_outdoor: "Udetemperatur",
				ch_pump: "Varmepumpe status",
				dhw: "Varmt brugsvand",
				dhw_cold_in: "Koldt vand ind (KV)",
				dhw_hot_out: "Varmt vand ud (BV)",
				dhw_flow: "Brugsvandsflow",
				dhw_valve: "Brugsvandsventil position",
				dhw_setpoint: "Brugsvand setpunkt",
				dhw_status: "Brugsvand status",
				circulation: "Cirkulation (varmt brugsvand)",
				circulation_temp: "Cirkulation returtemperatur",
				circulation_status: "Cirkulationspumpe status",
				circulation_bypass_temp: "Cirkulation bypass temperatur",
				controls: "Styring & alarmer",
				standby: "Standby kontakt",
				vacation: "Ferie kontakt",
				alarms: "Alarm-/fejlenheder",
				appearance: "Udseende",
				animation: "Animation",
				flow_animation: "Flow-animation",
				show_labels: "Vis labels",
				show_temperatures: "Vis temperaturer",
				compact: "Kompakt",
				swap_sides: "Byt om på venstre/højre (frem ↔ retur)",
				temperature_colors: "Temperaturfarver",
				threshold_white: "Hvid fra",
				threshold_blue: "Blå fra",
				threshold_green: "Grøn fra",
				threshold_yellow: "Gul fra",
				threshold_orange: "Orange fra",
				threshold_red: "Rød fra"
			}
		};
		return translations[this._language()]?.[key] || translations.en[key] || key;
	}
	_schema() {
		return [
			{
				type: "expandable",
				name: "primary",
				title: this._t("primary"),
				flatten: true,
				icon: "mdi:transmission-tower",
				schema: [
					{
						name: "primary_supply",
						selector: { entity: { domain: "sensor" } }
					},
					{
						name: "primary_return",
						selector: { entity: { domain: "sensor" } }
					},
					{
						name: "primary_cooling",
						selector: { entity: { domain: "sensor" } }
					},
					{
						name: "pressure",
						selector: { entity: { domain: "sensor" } }
					}
				]
			},
			{
				type: "expandable",
				name: "meter",
				title: this._t("meter"),
				flatten: true,
				icon: "mdi:counter",
				schema: [
					{
						name: "meter_energy_total",
						selector: { entity: { domain: "sensor" } }
					},
					{
						name: "meter_volume_total",
						selector: { entity: { domain: "sensor" } }
					},
					{
						name: "meter_flow",
						selector: { entity: { domain: "sensor" } }
					}
				]
			},
			{
				type: "expandable",
				name: "ch",
				title: this._t("ch"),
				flatten: true,
				icon: "mdi:radiator",
				schema: [
					{
						name: "ch_supply",
						selector: { entity: { domain: "sensor" } }
					},
					{
						name: "ch_return",
						selector: { entity: { domain: "sensor" } }
					},
					{
						name: "ch_valve",
						selector: { entity: { domain: "sensor" } }
					},
					{
						name: "ch_outdoor",
						selector: { entity: { domain: "sensor" } }
					},
					{
						name: "ch_pump",
						selector: { entity: {} }
					}
				]
			},
			{
				type: "expandable",
				name: "dhw",
				title: this._t("dhw"),
				flatten: true,
				icon: "mdi:water-thermometer",
				schema: [
					{
						name: "dhw_cold_in",
						selector: { entity: { domain: "sensor" } }
					},
					{
						name: "dhw_hot_out",
						selector: { entity: { domain: "sensor" } }
					},
					{
						name: "dhw_flow",
						selector: { entity: { domain: "sensor" } }
					},
					{
						name: "dhw_valve",
						selector: { entity: { domain: "sensor" } }
					},
					{
						name: "dhw_setpoint",
						selector: { entity: { domain: "sensor" } }
					},
					{
						name: "dhw_status",
						selector: { entity: {} }
					}
				]
			},
			{
				type: "expandable",
				name: "circulation",
				title: this._t("circulation"),
				flatten: true,
				icon: "mdi:pump",
				schema: [
					{
						name: "circulation_bypass_temp",
						selector: { entity: { domain: "sensor" } }
					},
					{
						name: "circulation_temp",
						selector: { entity: { domain: "sensor" } }
					},
					{
						name: "circulation_status",
						selector: { entity: {} }
					}
				]
			},
			{
				type: "expandable",
				name: "controls",
				title: this._t("controls"),
				flatten: true,
				icon: "mdi:alert-circle-outline",
				schema: [
					{
						name: "standby",
						selector: { entity: { domain: "switch" } }
					},
					{
						name: "vacation",
						selector: { entity: { domain: "switch" } }
					},
					{
						name: "alarms",
						selector: { entity: {
							domain: "binary_sensor",
							multiple: true
						} }
					}
				]
			},
			{
				type: "expandable",
				name: "temperature_colors",
				title: this._t("temperature_colors"),
				flatten: true,
				icon: "mdi:palette-outline",
				schema: [
					{
						name: "threshold_white",
						selector: { number: {
							min: -20,
							max: 100,
							step: .5,
							mode: "box",
							unit_of_measurement: "°C"
						} }
					},
					{
						name: "threshold_blue",
						selector: { number: {
							min: -20,
							max: 100,
							step: .5,
							mode: "box",
							unit_of_measurement: "°C"
						} }
					},
					{
						name: "threshold_green",
						selector: { number: {
							min: -20,
							max: 100,
							step: .5,
							mode: "box",
							unit_of_measurement: "°C"
						} }
					},
					{
						name: "threshold_yellow",
						selector: { number: {
							min: -20,
							max: 100,
							step: .5,
							mode: "box",
							unit_of_measurement: "°C"
						} }
					},
					{
						name: "threshold_orange",
						selector: { number: {
							min: -20,
							max: 100,
							step: .5,
							mode: "box",
							unit_of_measurement: "°C"
						} }
					},
					{
						name: "threshold_red",
						selector: { number: {
							min: -20,
							max: 100,
							step: .5,
							mode: "box",
							unit_of_measurement: "°C"
						} }
					}
				]
			},
			{
				type: "expandable",
				name: "appearance",
				title: this._t("appearance"),
				flatten: true,
				icon: "mdi:palette",
				schema: [
					{
						name: "flow_animation",
						selector: { boolean: {} }
					},
					{
						name: "show_labels",
						selector: { boolean: {} }
					},
					{
						name: "show_temperatures",
						selector: { boolean: {} }
					},
					{
						name: "compact",
						selector: { boolean: {} }
					},
					{
						name: "swap_sides",
						selector: { boolean: {} }
					}
				]
			}
		];
	}
	_computeLabel(schema) {
		return this._t(schema.name) || schema.title || schema.name;
	}
	_valueChanged(event) {
		event.stopPropagation();
		const value = event.detail.value || {};
		const thresholdValue = (key, fallback) => {
			const parsed = Number.parseFloat(value[key]);
			return Number.isFinite(parsed) ? parsed : fallback;
		};
		const next = structuredClone(this._config || {});
		next.entities = {
			...next.entities || {},
			primary_supply: value.primary_supply || void 0,
			primary_return: value.primary_return || void 0,
			primary_cooling: value.primary_cooling || void 0,
			pressure: value.pressure || void 0,
			meter_energy_total: value.meter_energy_total || void 0,
			meter_volume_total: value.meter_volume_total || void 0,
			meter_flow: value.meter_flow || void 0,
			ch_supply: value.ch_supply || void 0,
			ch_return: value.ch_return || void 0,
			ch_valve: value.ch_valve || void 0,
			ch_outdoor: value.ch_outdoor || void 0,
			ch_pump: value.ch_pump || void 0,
			dhw_cold_in: value.dhw_cold_in || void 0,
			dhw_hot_out: value.dhw_hot_out || void 0,
			dhw_flow: value.dhw_flow || void 0,
			dhw_valve: value.dhw_valve || void 0,
			dhw_setpoint: value.dhw_setpoint || void 0,
			dhw_status: value.dhw_status || void 0,
			circulation_temp: value.circulation_temp || void 0,
			circulation_status: value.circulation_status || void 0,
			circulation_bypass_temp: value.circulation_bypass_temp || void 0,
			standby: value.standby || void 0,
			vacation: value.vacation || void 0,
			alarms: Array.isArray(value.alarms) ? value.alarms : []
		};
		next.temperature_thresholds = {
			...next.temperature_thresholds || {},
			white: thresholdValue("threshold_white", 5),
			blue: thresholdValue("threshold_blue", 20),
			green: thresholdValue("threshold_green", 35),
			yellow: thresholdValue("threshold_yellow", 45),
			orange: thresholdValue("threshold_orange", 55),
			red: thresholdValue("threshold_red", 65)
		};
		next.appearance = {
			...next.appearance || {},
			flow_animation: value.flow_animation !== false,
			show_labels: value.show_labels !== false,
			show_temperatures: value.show_temperatures !== false,
			compact: value.compact === true,
			swap_sides: value.swap_sides === true
		};
		Object.keys(next.entities).forEach((key) => {
			if (next.entities[key] === void 0) delete next.entities[key];
		});
		Object.keys(next.appearance).forEach((key) => {
			if (next.appearance[key] === void 0) delete next.appearance[key];
		});
		this.dispatchEvent(new CustomEvent("config-changed", {
			detail: { config: next },
			bubbles: true,
			composed: true
		}));
	}
	_render() {
		if (!this.shadowRoot) return;
		let form = this.shadowRoot.querySelector("ha-form");
		if (!form) {
			this.shadowRoot.innerHTML = `
        <style>
          ha-form {
            display: block;
          }
        </style>
        <ha-form></ha-form>
      `;
			form = this.shadowRoot.querySelector("ha-form");
			form.computeLabel = (schema) => this._computeLabel(schema);
			form.addEventListener("value-changed", (event) => this._valueChanged(event));
		}
		const schemaCacheKey = `${this._language()}:0.17.0-consistent-sides`;
		if (!this._schemaCache || this._schemaCacheKey !== schemaCacheKey) {
			this._schemaCache = this._schema();
			this._schemaCacheKey = schemaCacheKey;
		}
		form.schema = this._schemaCache;
		form.hass = this._hass;
		form.data = this._formData();
	}
};
if (!customElements.get("fjernvarme-card")) customElements.define("fjernvarme-card", FjernvarmeCard);
if (!customElements.get("fjernvarme-card-editor")) customElements.define("fjernvarme-card-editor", FjernvarmeCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({
	type: "fjernvarme-card",
	name: "Fjernvarme Card",
	description: "Animated district heating substation card (Wavin Calefa / Kamstrup style).",
	preview: true
});
window.__FJERNVARME_CARD_VERSION__ = "0.17.0-consistent-sides";
console.info("%c Fjernvarme Card %c loaded v0.1.0 ", "color: white; background: #1976d2; font-weight: 700; padding: 2px 4px; border-radius: 3px 0 0 3px;", "color: white; background: #d32f2f; font-weight: 700; padding: 2px 4px; border-radius: 0 3px 3px 0;");
//#endregion
