var args = arguments[0] || {};


var job = Alloy.Collections.printJob.get(args.printId);


function openWindow(){

	if(!job){
		$.printDetail.close();
		return;
	}
	Ti.API.info("display info about print job");
	$.detailName.text = job.get("name");
	$.detailType.text = job.get("type");
	$.detailSize.text = humanFileSize(job.get("size"), true);

	
  	var date = new Date(job.get("date"));
  	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();
	
	var minutes = date.getMinutes();
	var hours = date.getHours();

	$.detailAdded.text = addZero(day) + ". " + addZero(month) + ". " + year + " " + addZero(hours) + ":" + addZero(minutes);
	
	
	
	
	$.detailBWPages.text = job.get("pagesBw");
	$.detailColorPages.text = job.get("pagesColor");
	$.detailOwner.text = job.get("owner");
	$.detailPaperSize.text = job.get("paperSize");
	$.detailType.text = job.get("type");
	$.detailFavorite.text = job.get("status") === "favorite" ? L('yes') : L('no');
	
}


function addZero(numb){
	return numb < 9 ? "0" + numb : numb;
}



function humanFileSize(bytes, si) {
    var thresh = si ? 1000 : 1024;
    if(bytes < thresh) return bytes + ' B';
    var units = si ? ['kB','MB','GB','TB','PB','EB','ZB','YB'] : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(bytes >= thresh);
    return bytes.toFixed(1)+' '+units[u];
}