'use strict';

const GPIODevice = require('/lib/GPIODevice.js');

module.exports = class GPIO_Pulse_Device extends GPIODevice {

	initPin() {
		if (this.properties.output.bool) {
			this.unit.sendCommand([
				this.properties.output.bool,
				this.properties.pin,
				this.getSetting('invert') === true ? 1 : 0
			]);
		} else {
			this.log('Pin', pin.id, 'does not have boolean output capability! This is recommended for pin initialization.');
		}
	}

	set(newState, options = {}, callback = () => { }) {
		if (this.properties.output.pulse) {
			let duration = this.getSetting('duration');
			let command = this.properties.output.pulse;
			let state = this.getSetting('invert') === true ? 0 : 1;
			this.log('Pulse pin', this.id, 'for', duration, 'ms to', state ? "'on'" : "'off'");

			if (duration > 1000 && this.properties.output.longpulsems)
				command = this.properties.output.longpulsems;

			this.unit.sendCommand([
				command,
				this.properties.pin,
				state,
				duration
			], callback);
		} else {
			this.log('Pin', pin.id, 'does not have pulse output capability!');
		}
	}
}