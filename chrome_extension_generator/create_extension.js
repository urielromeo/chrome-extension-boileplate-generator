const baseManifest = {
    "name": "Chrome extension",
    "description": "Generated with chrome extension generator",
    "version": "0.1.0",
    "manifest_version": 3,
    "icons": {
        "16": "icon16.png",
        "48": "icon48.png",
        "128": "icon128.png"
    },
}

const file = (path, filename, content) => { return { path, filename, content } };

async function getTextResource(url) {
    let body = await fetch(url);
    let text = await body.text();
    return text;
}

async function getTextResource(url) {
    let body = await fetch(url);
    let text = await body.text();
    return text;
}

function getBinaryContent(url) {
    return new Promise(function(resolve, reject) {
        JSZipUtils.getBinaryContent(url, function (err, data) {
            if(err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

var popupHtml;
var popupCss;
var manifest = { ...baseManifest }
var filesList = [];

async function generateExtension(parameters) {        
    let zip = new JSZip();
    let zipOptions = { type: "blob" };
    let extensionFolder = zip.folder("extension");
    manifest["permissions"] = getPermissions();
    filesList.push(file([], "manifest.json", JSON.stringify(manifest)));
    extensionFolder.file("icon16.png", getBinaryContent("./extension_boilerplate/icon16.png", { binary: true }));
    extensionFolder.file("icon48.png", getBinaryContent("./extension_boilerplate/icon48.png", { binary: true }));
    extensionFolder.file("icon128.png", getBinaryContent("./extension_boilerplate/icon128.png", { binary: true }));

    for (let f = 0; f < filesList.length; f++) {
        const file = filesList[f];
        let currentFolder = extensionFolder;
        for (let ff = 0; ff < file.path.length; ff++) {
            currentFolder = currentFolder.folder(file.path[ff]);
        }
        currentFolder.file(file.filename, file.content);
    }
    zip.generateAsync(zipOptions).then(function(content) {
        saveAs(content, "extension.zip");
        // let url = URL.createObjectURL(content);
        // chrome.tabs.create({ url });    
    });
}

function getParameters() {
    let popupCheckbox = $("#popupCheckbox").is(".checked");
    let backgroundCheckbox = $("#backgroundCheckbox").is(".checked");
    let contentScript = {};
    contentScript["js"] = $("#contentScriptJSCheckbox").is(".checked");
    contentScript["css"] = $("#contentScriptCSSCheckbox").is(".checked");
    contentScript["enable"] = contentScript["js"] || contentScript["css"];
    return {
        popupCheckbox,
        backgroundCheckbox,
        contentScript
    }
}

function getPermissions() {
    return $(".permissions-select").val();
}

function updateExtensionManifest(params) {
    filesList = [];
    if(params.popupCheckbox == true) {
        manifest["action"] = {
            default_popup: "popup.html",
            default_icon: {}
        }
        filesList.push(file([], "popup.html", popupHtml));
        filesList.push(file([], "popup.js", ""));
        filesList.push(file([], "popup.css", popupCss));
    } else {
        delete manifest.action;
    }
    if(params.backgroundCheckbox == true) {
        manifest["background"] = {
            service_worker: "background.js"
        };
        filesList.push(file([], "background.js", ""));
    } else {
        delete manifest.background;
    }
    if(params.contentScript.enable == true) {
        let contentScript = {
            "matches": ["http://*/*", "https://*/*"],
            "run_at": "document_end"
        };
        if(params.contentScript.js) {
            contentScript["js"] = ["contentScript.js"];
            filesList.push(file([], "contentScript.js", ""));
        }
        if(params.contentScript.css) {
            contentScript["css"] = ["contentScript.css"];
            filesList.push(file([], "contentScript.css", ""));
        }
        manifest["content_scripts"] = [ contentScript ];
    } else {
        delete manifest.content_scripts;
    }
    updateExtensionPreview();
}

function updateExtensionPreview() {
    $(".manifestPreview pre").html(JSON.stringify(manifest, null, 2));
}

function downloadButtonOnClick(e) {
    e.preventDefault();
    e.stopPropagation();
    generateExtension(getParameters());
}

function checkboxOnClick(e){
    $(this).toggleClass("checked");
    updateExtensionManifest(getParameters());
}

function aboutButtonOnClick(e) {
    $(this).parent().toggleClass("showCredits");
}

function assignHandlers() {
    $(".checkbox").on("click", checkboxOnClick);
    $(".download").on("click", downloadButtonOnClick);
    $("#about, #closeCredits").on("click", aboutButtonOnClick);
}

async function init() {
    assignHandlers();
    updateExtensionManifest(getParameters());
    popupHtml = await getTextResource("./extension_boilerplate/popup.html");
    popupCss = await getTextResource("./extension_boilerplate/popup.css");
}

init();