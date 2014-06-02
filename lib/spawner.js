'use strict';

var EventEmitter = require('events').EventEmitter,
    fork = require('child_process').fork,
    util = require('util');

function Spawner(file) {
	this.file = file;
	this.children = [];
	this.respawn = true;

	this.bind();
	this.fork();

	return this;
}
util.inherits(Spawner, EventEmitter);

Spawner.prototype.bind = function () {
	process.on('uncaughtException', function (err) {
		console.error(err.stack || String(err));
		this.kill('SIGKILL');
		process.exit(1);
	}.bind(this));

	process.on('SIGINT', this.killall.bind(this));
  process.on('SIGTERM', this.killall.bind(this));
  process.on('SIGQUIT', this.shutdown.bind(this));
};

Spawner.prototype.fork = function () {
	var child = fork(this.file);

	child.on('message', function (message) {
		if (message === 'online') {
			this.emit('online');
		}
	}.bind(this));

	child.on('exit', function (code) {
		this.children.splice(this.children.indexOf(child), 1);

		if (this.respawn) {
			if (code === null) {
				this.fork();
			} else {
				this.emit('error', code);
			}
		}
	}.bind(this));

	this.children.push(child);
};

Spawner.prototype.killall = function () {
	this.respawn = false;
	this.kill('SIGKILL');
	process.nextTick(process.exit.bind(process));
};

Spawner.prototype.shutdown = function () {
	this.respawn = false;
	this.kill('SIGQUIT');
	process.nextTick(process.exit.bind(process));
};

Spawner.prototype.kill = function (signal) {
	this.children.forEach(function (child) {
		child.kill(signal);
	});
};

Spawner.prototype.restart = function () {
	if (this.children.length > 0) {
		this.kill('SIGQUIT');
	} else {
		this.fork();
	}
};

module.exports = exports = Spawner;
