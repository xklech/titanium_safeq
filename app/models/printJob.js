exports.definition = {
	config: {
		columns: {
		    "id": "INTEGER PRIMARY KEY",
		    "status": "TEXT",
		    "type": "TEXT",
		    "name": "TEXT",
		    "size": "INTEGER",
		    "date": "INTEGER",
		    "pagesBw": "INTEGER",
		    "pagesColor": "INTEGER",
		    "paperSize": "TEXT",
		    "owner": "TEXT"
		},
		adapter: {
			type: "sql",
			collection_name: "printJob",
			idAttribute: 'id'
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			validate : function(attrs) {
				for (var key in attrs) {
					var value = attrs[key];
					if (value) {
						if (key === "id") {
							if (value < 0) {
								return 'Error: Id lower than 0!';
							}
						}
						if (key === "name") {
							if (value.length <= 0) {
								return 'Error: Empty name!';
							}
						}
						if (key === "date") {
							if (value <= 0) {
								return 'Error: Invalid date!';
							}
						}
						if (key === "status") {
							switch(value){
								case "waiting":
								case "favorite":
								case "printed":
								case "processing":
								break;
								default:
								return 'Error: Unknown status!';
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