var isRoot = require('is-root');
var inquirer = require("inquirer");
var fs = require("fs");

var dirApache = "/etc/apache2";
var dirEnabledConfigs = "/etc/apache2/sites-enabled";
var dirAvailableConfigs = "/etc/apache2/sites-available";

var enabledConfigs = [];
var availableConfigs = [];

function getEnabledConfigs() {
	fs.readdir(dirEnabledConfigs, function(err, files) {
		if (err) handleErr(err);
		if (files.length) {
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
		}
	});
}

function showMainMenu() {
	var question = {
		type: "checkbox",
		name: "sites",
		message: "Which sites do you want enabled?",
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
	// loop through all available sites
	availableConfigs.forEach(function(site) {
		// do we want site enabled?
		if (newConfig.indexOf(site) > -1) {
			// yes, is it already enabled?
			if (enabledConfigs.indexOf(site) == -1) {
				// no, enabled it
				fs.symlinkSync(dirAvailableConfigs + "/" + site, dirEnabledConfigs + "/" + site);
				console.log("linked site: " + site);
			}
		} else {
			// no, is it enabled?
			if (enabledConfigs.indexOf(site) > -1) {
				// yes, disable it
				fs.unlinkSync(dirEnabledConfigs + "/" + site);
				console.log("unlinked site: " + site);
			}
		}
	});
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