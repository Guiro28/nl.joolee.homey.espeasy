'use strict';

const GeneralDriver = require('/lib/GeneralDriver.js');
const Homey = require('homey');

module.exports = class SensorDriver extends GeneralDriver {
	onInit() {
		super.onInit();
	}

	isValidTask(task) {
		return this.taskTypes.find(type => type.name == task.Type);
	}

	getDefaultCapabilities() {
		return this.getManifest().capabilities;
	}

	getValues(task) {
		return this.values;
	}

	onPair(socket) {
		socket.on('list_devices', (data, callback) => {
			let unitsTodo = Homey.app.units.units.length;
			this.tasks = [];
			Homey.app.units.listOnline().forEach(unit => {
				unit.updateJSON(false, (error, unit) => {
					const newTasks = unit.getFreeTasks().filter(task => this.isValidTask(task));

					this.tasks.push(...newTasks.map(task => {
						this.log(`Found task: ${unit.name} - ${task.TaskName}`);
						let device = {
							"name": `${task.TaskName} (${unit.name})`,
							"data": {
								"name": task.TaskName,
								"controllers": task.DataAcquisition,
								"taskid": task.TaskNumber,
								"unit": {
									"name": unit.name,
									"idx": unit.idx,
									"mac": unit.mac,
									"host": unit.hostname,
									"port": unit.port
								}
							}
						}

						let capabilities = this.getDefaultCapabilities().map(cap => ({ "capabilities": cap }));
						this.getValues(task).forEach((value, index) => {
							capabilities.push({
								"index": index,
								"name": value.name,
								"capabilities": this.expandCapabilities(value.capability)
							});
						});


						if (capabilities)
							device.data.capabilities = capabilities;

						return device;

					}));

					// No more units?
					if (--unitsTodo) {
						socket.emit('list_devices', this.tasks);
					} else {
						callback(null, this.tasks);
					}
				})
			});
		});
	}
}