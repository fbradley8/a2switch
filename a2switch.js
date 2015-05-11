#!/usr/bin/env node
var fs = require('fs');
var sys = require('sys');
var isRoot = require('is-root');
var inquirer = require('inquirer');
var exec = require('child_process').exec;

var dirApache = '/etc/apache2';
var dirEnabledConfigs = '/etc/apache2/sites-enabled';
var dirAvailableConfigs = '/etc/apache2/sites-available';

var enabledConfigs = [];
var availableConfigs = [];

function getEnabledConfigs() {
	fs.readdir(dirEnabledConfigs, function(err, files) {
		if (err) handleErr(err);
		if (files) {
			enabledConfigs = files;
			getAvailableConfigs();
		}
	});
}

function getAvailableConfigs() {
	fs.readdir(dirAvailableConfigs, function(err, files) {
		if (err) handleErr(err);
		if (files.length) {
			availableConfigs = files;
			showMainMenu();
		} else {
			console.log('No available Apache configs.');
		}
	});
}

function showMainMenu() {
	var question = {
		type: 'checkbox',
		name: 'sites',
		message: 'Which sites do you want enabled?',
		default: enabledConfigs,
		choices: availableConfigs
	};
	prompt(question);
}

function prompt(question) {
	inquirer.prompt(question, function(answers) {
		updateLinks(answers.sites);
	});
}

function updateLinks(newConfig) {
	availableConfigs.forEach(function(site) {
		if (newConfig.indexOf(site) > -1) {
			if (enabledConfigs.indexOf(site) == -1) {
				fs.symlinkSync(dirAvailableConfigs + '/' + site, dirEnabledConfigs + '/' + site);
				console.log('linked site: ' + site);
			}
		} else {
			if (enabledConfigs.indexOf(site) > -1) {
				fs.unlinkSync(dirEnabledConfigs + '/' + site);
				console.log('unlinked site: ' + site);
			}
		}
	});
	reloadApache();
}

function reloadApache() {
	exec('service apache2 reload', puts);
}

function puts(error, stdout, stderr) {
	sys.puts(stdout);
}

function handleErr(err) {
	console.log(err);
}

function init() {
	if (isRoot()) {
		getEnabledConfigs();
	} else {
		console.log('Must be run with root permissions.')
	}
}

init();