// ==UserScript==
// @name         war-riders plugin
// @namespace    ogame_generalanasazi_warriders
// @version      1.0
// @description  add direct links to War Riders to the tooltips in the galaxy view
// @author       GeneralAnasazi
// @include     *ogame.gameforge.com/game/index.php?page=galaxy*
// @grant        none
// ==/UserScript==


// constants

// global vars
var debug = false; // set it to true enable debug messages -> log(msg)
var idIntervalLoadInfo = -1; // to check if somethings is to do
var language = document.getElementsByName('ogame-language')[0].content;
var lastIdLink;
var universeId = 0;

// translation vars
// no translation needed atm (maybe for russian players with another charset)

// global log function
// if debug is false, no logs will be shown (for a release version)
function log(text)
{
    if (debug)
        console.log(text);
}

// append a link to a tooltip
// returns the link collection
function appendLink(toolTip, linkHtml, idLink)
{
    // insertExtensions
    var ul = toolTip.getElementsByTagName('ul');
    if (ul[0] && !document.getElementById(idLink))
    {
        var newLI = document.createElement("LI");
        newLI.id = idLink;
        newLI.innerHTML = linkHtml;
        ul[0].appendChild(newLI);
        lastIdLink = idLink;
    }

    return ul[0];
}

// append war-riders a link to a tooltip
// returns the link collection
function appendWarRidersLink(toolTip, name, type, idLink)
{
    var link = '<a href="http://www.war-riders.de/'+language+'/'+universeId+'/search/'+type+'/'+name+'" target="_blank" rel="noopener">War Riders</a>';
    return appendLink(toolTip, link, idLink);
}

// loading the alliance page
// returns the whole page as text
function getAllianceSite(allianceId) {
	return $.ajax({
		type: 'POST',
		url: '/game/allianceInfo.php?allianceId=' + allianceId,
		dataType: 'text',
		context: document.body,
		global: false,
		async:false,
		success: function(data) {
            return data;
		}
	}).responseText;
}

// extract the alliance tag from the html page "/game/allianceInfo.php"
// returns alliance tag
function getAllianceTag(allianceId)
{
    var htmlText = getAllianceSite(allianceId);
    var result = '';
    // extract Tag
    var idxStart = htmlText.indexOf('<td>Tag</td>') + 12;
    if (idxStart > -1)
    {
        htmlText = htmlText.substr(idxStart);
        idxStart = htmlText.indexOf('<td>') + 4;
        htmlText = htmlText.substr(idxStart);
        var idxEnd = htmlText.indexOf('</td>');
        if (idxEnd > -1)
        {
            htmlText = htmlText.substr(0, idxEnd);
            result = htmlText.split(' ')[0];
        }
    }
    return result;
}

// returns the rows of the galaxyTable
function getGalaxyRows()
{
    var result = null;
    var galaxyContent = document.getElementById('galaxyContent');
    if (galaxyContent)
    {
        var table = galaxyContent.getElementsByTagName('tbody')[0];
        if (table)
        {
            result = table.getElementsByTagName('tr');
        }
    }
    else
        log('galaxyContent not found');

    return result;
}

// extract the universe id from the server address
// returns universeId
function getUniverseId()
{
    //<meta name="ogame-universe" content="s148-de.ogame.gameforge.com"/>
    var universe = document.getElementsByName('ogame-universe')[0].content;
    return universe.split('-')[0].substring(1, universe.length - 1);
}

// add links to the tooltip alliance in the galaxyTable
// returns the alliance tag
function insertExtensionsAlliance(col)
{
    var result = null;
    var linkAlliance = col.getElementsByTagName('span');
    if (linkAlliance[0])
    {
        var attrRel = linkAlliance[0].getAttribute('rel');
        var idLink = 'link_warriders_' + attrRel;
        var toolTip = document.getElementById(attrRel);
        if (toolTip)
        {
            result = linkAlliance[0].innerText;
            if (result.endsWith('...'))
            {
                var allianceId = linkAlliance[0].getAttribute('rel').replace('alliance', '');
                result = getAllianceTag(allianceId);
            }
            appendWarRidersLink(toolTip, result, 'ally', idLink);
        }
    }

    return result;
}

// insert a new link to the player tooltip
// returns the playername
function insertExtensionsPlayerName(col)
{
    var result = null;
    var linkPlayer = col.getElementsByTagName('a');
    if (linkPlayer[0])
    {
        var attrRel = linkPlayer[0].getAttribute('rel');
        if (attrRel)
        {
            var idLink = 'link_warriders_' + attrRel;
            var toolTip = document.getElementById(attrRel);
            if (toolTip)
            {
                // getPlayerName
                var span = toolTip.getElementsByTagName('span');
                if (span[0])
                    result = span[0].innerHTML;

                // insertExtensions
                appendWarRidersLink(toolTip, result, 'player', idLink);
            }
        }
        else
            result = linkPlayer[0].innerText;
    }
    return result;
}

function addLinks()
{
    log('start addLinks');
    var id = setInterval(function() {
        // When an idLink exists, we need no action and wait again
        if (!(lastIdLink && document.getElementById(lastIdLink)))
        {
            var rows = getGalaxyRows();
            if (rows)
            {
                for (var i=0; i < rows.length; i++)
                {
                    // Columns of the galaxy table
                    // planetPosition|planetIcon|planetName|moon|tf|playerName|AllienceTag|actions
                    var columns = rows[i].getElementsByTagName('td');

                    var playerName = insertExtensionsPlayerName(columns[5]);
                    if (playerName)
                    {
                        log('insert new extensions to player ' + playerName);
                    }
                    var allianceTag = insertExtensionsAlliance(columns[6]);
                    if (allianceTag)
                    {
                        log('insert new extensions to alliance ' + allianceTag);
                    }
                }
                result = true;
                log('addLinks succesful finished');
            }
        }
    }, 500);
}

function startScript()
{
    universeId = getUniverseId();
    log('Universe ID: ' + universeId);
    addLinks();
}

startScript();
