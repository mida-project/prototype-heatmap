// Load in HTML templates
var viewportPath = "../public/templates/viewport.html";
var studyViewerPath = "../public/templates/studyViewer.html";
var overlayPath = "../public/templates/overlay.html"

// The file with the list of all studies.
var fileName = '../common/studyList';
var fileFormat = '.json';
var studyListFile = fileName + fileFormat;

console.log('Read Study List File From: \n', studyListFile);

var viewportTemplate; // the viewport template
loadTemplate(viewportPath, function(element) {
  viewportTemplate = element;
});

var studyViewerTemplate; // the study viewer template
loadTemplate(studyViewerPath, function(element) {
  studyViewerTemplate = element;
});
 var overlayTemplate; // the study viewer template
loadTemplate(overlayPath, function(element) {
  overlayTemplate = element;
});

// Get study list from JSON manifest
$.getJSON(studyListFile, function(data) {
  console.log("Getting study list...");
  if (typeof data.studyList === "object") {
    console.log("Consuming study list...");
    data.studyList.forEach(function(study) {
      console.log("Creating study list tables...");
      // Create one table row for each study in the manifest
      var studyRow = '<tr><td>' +
        study.patientId + '</td><td>' +
        study.studyDate + '</td><td>' +
        study.modality + '</td><td>' +
        study.studyDescription + '</td><td>' +
        study.numImages + '</td><td>' +
        '</tr>';

      // Append the row to the study list
      var studyRowElement = $(studyRow).appendTo('#studyListData');

      // On study list row click
      $(studyRowElement).click(function() {
        if ($('#tabs li').length >= 2) {
          alert('Please close the opened patient first !');
        } else {
          console.log("%%%%%%%%%%%"+study.patientId);
          // Add new tab for this study and switch to it
          var studyTab = '<li><div id=complete-tab><a href="#x' + study.patientId + '" data-toggle="tab">' + study.patientId + '</a>' +
            '<input type="button" class="closeBtn" value="X" />' + '</li></div>';
          $('#tabs').append(studyTab);
          // Add tab content by making a copy of the studyViewerTemplate element
          var studyViewerCopy = studyViewerTemplate.clone();

          var viewportCopy = viewportTemplate.clone();
          var overlayCopy = overlayTemplate.clone();
          studyViewerCopy.find('.imageViewer').append(viewportCopy);
          studyViewerCopy.find('.imageViewer').append(overlayCopy);

          studyViewerCopy.attr("id", 'x' + study.patientId);
          // Make the viewer visible
          studyViewerCopy.removeClass('hidden');
          overlayCopy.appendTo('#ppp');
          overlayCopy.addClass('hidden');

          // Add section to the tab content
          studyViewerCopy.appendTo('#tabContent');

          // Show the new tab (which will be the last one since it was just added
          $('#tabs a:last').tab('show');

          // Toggle window resize (?)
          $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
            $(window).trigger('resize');
          });

          studyViewerCopy.roiData = {
            studyId: study.studyId,
            modality: study.modality,
            stacks: [],
          };

          $('.closeBtn').click(function() {
            localStorage.globalval = '';
            overlayCopy.remove();
            var element = this.parentNode.parentNode;
            $('#tabs a:first').tab('show');
            element.remove();
            var tabDataElement = element.firstChild.firstChild.getAttribute('href');
            if($(tabDataElement).length > 0){
              $(tabDataElement)[0].remove();
            } 
          });
          $('.imageViewer').click(function() {
            var filenameurl = "../common/images/"
            var imageid = localStorage.globalval.split(",");
            if (imageid != ''){
              $('#base').attr('src', filenameurl+imageid[0]);
              $('#cloud').attr('src', filenameurl+imageid[1]);
              $('#full').attr('src', filenameurl+imageid[2]);
              $('#high').attr('src', filenameurl+imageid[3]);
              $('#low').attr('src', filenameurl+imageid[4]);
              $('#medium').attr('src', filenameurl+imageid[5]);
            }
            else {
              $('#base').attr('src', filenameurl+imageid[0]);
              $('#cloud').attr('src', filenameurl+'default_cloud.png');
              $('#full').attr('src', filenameurl+'default_full.png');
              $('#high').attr('src', filenameurl+'default_high.png');
              $('#low').attr('src', filenameurl+'default_low.png');
              $('#medium').attr('src', filenameurl+'default_medium.png');
            }
            overlayCopy.removeClass('hidden');
           $('.viewer').load(overlayPath);
            var element = this.parentNode.parentNode;
            element.remove();
                              //  var base = $('#base');
            console.log("localstorage:"+localStorage.globalval);
          });
          // Now load the study.json
          loadStudy(studyViewerCopy, viewportTemplate, study.studyId + fileFormat);
        }
      });
    });
  } else {
    console.log("There is no list of studies. Please Upload some DICOM files.");
  }
});

// Resize main


// Show tabs on click
$('#tabs a').click (function(e) {
  e.preventDefault();
  $(this).tab('show');
});

// Resize main
function resizeMain() {
  var height = $(window).height();
  $('#main').height(height - 50);
  $('#tabContent').height(height - 50 - 42);
}

// Call resize main on window resize
$(window).resize(function() {
    resizeMain();
});
resizeMain();

// Prevent scrolling on iOS
document.body.addEventListener('touchmove', function(e) {
  e.preventDefault();
});
