const nodeGeocoder = require("node-geocoder");

const option = "openstreetmap";

const geocoder = nodeGeocoder(option);

module.exports = geocoder;