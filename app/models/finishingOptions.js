exports.definition = {
	config: {
		columns: {
		    "id": "INTEGER PRIMARY KEY",
		    "colorMode": "INTEGER",
		    "sides": "INTEGER",
		    "copyCount": "INTEGER",
		    "stapling": "INTEGER",
		    "punchHoles": "INTEGER",
		    "pageRangeFrom": "INTEGER",
		    "pageRangeTo": "INTEGER",
		    "folding": "INTEGER",
		    "binding": "INTEGER"
		},
		defaults: {
		    "colorMode": 0,
		    "sides": 0,
		    "copyCount": 1,
		    "stapling": 0,
		    "punchHoles": 0,
		    "pageRangeFrom": 1,
		    "pageRangeTo": 0,
		    "folding": 0,
		    "binding": 0
		},
		adapter: {
			type: "sql",
			collection_name: "finishingOptions",
			idAttribute: 'id'
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			validate : function(attrs) {
				for (var key in attrs) {
					var value = attrs[key];
					if (value) {
						if (key === "colorMode") {
							if (value < 0 || value > 3) {
								return 'Error: Invalid colorMode!';
							}
						}
						if (key === "sides") {
							if (value < 0 || value >1) {
								return 'Error: Empty sides!';
							}
						}
						if (key === "copyCount") {
							if (value < 1) {
								return 'Error: Invalid copyCount!';
							}
						}
						if (key === "stapling") {
							if (value < 0 || value > 6) {
								return 'Error: Invalid stapling!';
							}
						}
						if (key === "punchHoles") {
							if (value < 0 || value > 9) {
								return 'Error: Invalid punchHoles!';
							}
						}
						if (key === "pageRangeFrom") {
							if (value < 1 ) {
								return 'Error: Invalid pageRangeFrom!';
							}
						}
						if (key === "pageRangeTo") {
							if (value < 1 ) {
								return 'Error: Invalid pageRangeTo!';
							}
						}
						if (key === "folding") {
							if (value < 0 || value > 4) {
								return 'Error: Invalid folding!';
							}
						}
						if (key === "binding") {
							if (value < 0 || value > 6) {
								return 'Error: Invalid stapling!';
							}
						}
					}
				}
			}
		});

		return Model;
	},
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			comparator: function(printJob) {
				return printJob.get('id');
			}
		});
		return Collection;
	}
};