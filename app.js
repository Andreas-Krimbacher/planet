/*
 Atlas Project in Multimedia Cartography
 Institute of Cartography and Geoinformation
 ETH Zurich
 Author: Group 2
 2013-4-26: Added comments
 */

/*
 Load additional classes including direct dependencies.
 */
Ext.require([
    'Ext.util.CSS','*', 'Ext.data.*', 'Ext.grid.*','Ext.slider.*'
]);

/*
 This method is called after DOM construction and class loading
 */
Ext.onReady(function() {
    console.info('Atlas Project in Multimedia Cartography')
    console.info(new Date());
});

/*
 This section represents the Atlas application.
 */
Ext.application({
    name: 'Atlas Project in Multimedia Cartography',

    // The launch function is called after the page is loaded. Describes the appearance and behaviour of the atlas user interface.
    launch: function() {

        // This function is used for loading maps
        function sendMessage(msg) {
            var iframe = Ext.get('map').dom;

            function loadMap() {
                if (params.data) {
                    var win = iframe.contentWindow;
                    win.postMessage({ method: 'loadMap', params: params }, '*');
                }
            }

            switch (msg.method) {
                case 'loadMap':
                    var params = content[msg.id];
                    if (iframe['data-ref'] != params.src) {
                        // Loads a new map into the iframe
                        iframe['data-ref'] = params.src;
                        iframe.src = params.src;
                        iframe.onload = function(evt) {
                            loadMap();
                        }
                    }
                    else {
                        // Reuses the map but loads with new parameters.
                        loadMap();
                    }
                    break;
            }
        }

        // Displays a document (impressum) in a browser window.
        function createBrowserWindow(parentId, title, src) {
            var parent = Ext.get(parentId);
            var inset = 100;
            var left =  window.screenX + inset;
            var top = window.screenY + inset;
            var height = window.outerHeight - 2 * inset;
            var width = window.outerWidth - 2 * inset;
            var options = 'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top + ',resizable=true';
            var browserWindow = window.open(src, title, options);
            browserWindow.focus();
        }

        window.addEventListener('message', function (evt) {
            var data = evt.data;
            var method = data.method;
            switch (method) {
                case 'loadMap':
                    break;
                case 'mapInfo':
                    var panel = Ext.get('map-info').dom;
                    console.log('map-info', panel);
                    break;
            }
        });



        Ext.onReady(function() {


            Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));


            Ext.create('Ext.toolbar.Toolbar', {
                renderTo: document.body,
                width   : '100%',
                items   : [{
                    // First menu is about this atlas project.
                    id: 'aboutAtlas',
                    text: 'Atlas Project&nbsp;',
                    xtype: 'splitbutton',
                    // Menu entries follow here.
                    menu: new Ext.menu.Menu({
                        items: [
                            // Impressum is the first menu entry.
                            {
                                iconCls: 'next',
                                text: 'Impressum...',
                                // This function is called when the menu item is selected.
                                handler: function() {
                                    // We present the impressum document in a window.
                                    createBrowserWindow('map', 'Impressum', './resources/html/impressum.html');
                                }
                            }
                        ]
                    }),
                    // Listeners handle toolbar interactions.
                    listeners: {
                        // Handles click event in the toolbar item.
                        click: function(view, rec, item, index, eventObj) {
                            // We present an 'about' document in a window.
                            createChildWindow('map', 'About this Atlas', 'resources/html/about.html');
                        }
                    },
                }, {
                    // Next menu is a map menu
                    id: 'aboutMap',
                    text: 'Map&nbsp;',
                    xtype: 'splitbutton',
                    menu: new Ext.menu.Menu({
                        items: [
                            {
                                iconCls: 'next',
                                text: 'Open Map in New Window...',
                                handler: function() {
                                    // We present the current map in a new browser window.
                                    // var url = Ext.get('map').dom.src;
                                    var url = 'http://mmkarto.ethz.ch/group2/All/Planet/';
                                    window.open(url, url, 'scrollbars=yes,location=no', false);
                                }
                            },
                            {
                                iconCls: 'next',
                                text: 'Show Map URL',
                                handler: function() {
                                    // We show the URL of the current map.
                                    // var url = Ext.get('map').dom.src;
                                    var url = 'http://mmkarto.ethz.ch/group2/';
                                    alert('URL: ' + url);
                                }
                            }
                        ]
                    }),
                    listeners: {
                        // We present extra information about the current map.
                        click: function(view, rec, item, index, eventObj) {
                            // If the map file name is 'map.html', an info file 'map_info.html' is expected in the same directory.
                            var mapName = content[currentMapId].src;
                            var infoName = mapName.substr(0, mapName.lastIndexOf('.')) + '_info.html';
                            createChildWindow('map', 'About this Map', infoName);
                        }
                    }
                },{ xtype: 'tbfill'
                },{
                    xtype: 'button',
                    align: 'right',
                    iconCls: 'sun',
                    text:'Solar System'
                },{
                    xtype: 'button',
                    align:'right',
                    iconCls: 'earth-moon',
                    text:'Earth System'
                },{
                    xtype: 'button',
                    align:'right',
                    iconCls: 'earth',
                    text:'Earth'
                },{ xtype: 'tbfill'
                }
                ]
            });

            var viewport = Ext.create('Ext.Viewport', {
                id: 'border-example',
                layout: 'border',
                items: [
                    // create instance immediately

                    Ext.create('Ext.Component', {
                        region: 'north',
                        height: 32, // give north and south regions a height
                        autoEl: {
                            tag: 'div'
                        }
                    }), {
                        xtype: 'tabpanel',
                        region: 'east',
                        title: 'Info',
                        collapsible: true,
                        iconCls: 'info',
                        resizable: true,
                        frame: true,
                        resizeHandles: 'e',
                        width: 225,
                        activeTab: 0,
                        items: [{
                            // The first tab presents the layers as a tree.
                            title: 'Layer',
                            xtype: 'treepanel',
                            layout: 'fit',
                            rootVisible: false,
                            root: {
                                // The atlas content tree structure is defined here...
                                expanded: true,
                                children: [{
                                    text: 'Show Orbits', leaf: true
                                },{
                                    text: 'Show Tags',leaf: true
                                },{
                                    text: 'Show Dwarf Planets',leaf: true
                                },{
                                    text: 'Show Satellites',leaf: true
                                }]
                            },
                            /*listeners: {
                             // A click on a tree menu item start the loading of a map.
                             itemclick: function(view, rec, item, index, eventObj) {
                             currentMapId = rec.get('id');
                             sendMessage({method: 'loadMap', id: rec.get('id')});
                             }
                             },*/

                        }, {
                            // The second tab presents comparisons.
                            title: 'Comparison',
                            xtype: 'treepanel',
                            layout: 'fit',
                            rootVisible: false,
                            root: {
                                expanded: true,
                                children: [{
                                    text: '1st comparison'
                                }, {
                                    text: '2nd comparison', expanded: true, children: [{
                                        id: 'mpla',
                                        text: 'mpla', leaf: true
                                    }]
                                }, {
                                    text: '3rd comparison', expanded: true, children: [{
                                        id: 'mpla2',
                                        text: 'mpla mpla', leaf: true
                                    }]
                                }]
                            },
                            /*listeners: {
                             itemclick: function(view, rec, item, index, eventObj) {
                             currentMapId = rec.get('id');
                             sendMessage({method: 'loadMap', id: rec.get('id')});
                             }
                             },*/
                        }, {
                            // The third tab presents special events.
                            title: 'Special Costellations',
                            xtype: 'treepanel',
                            layout: 'fit',
                            rootVisible: false,
                            root: {
                                expanded: true,
                                children: [{
                                    text: 'Planetendurchg&#228;nge vor der Sonne', expanded: true, children: [{
                                        id: 'Merkurtransit',
                                        text: 'Merkurtransit', leaf: true
                                    }, {
                                        id: 'Venustransit',
                                        text: 'Venustransit', leaf: true
                                    },{
                                        id: 'Erddurchgang vom Mars',
                                        text: 'Erddurchgang vom Mars', leaf: true
                                    },{
                                        id: 'Jupiterdurchgang vom Uranus',
                                        text: 'Jupiterdurchgang vom Uranus', leaf: true
                                    }]
                                },{
                                    text: 'Okkultationen', expanded: true, children: [{
                                        id: 'Venus bedeckt Jupiter',
                                        text: 'Venus bedeckt Jupiter', leaf: true
                                    }, {
                                        id: 'Merkur bedeckt Jupiter',
                                        text: 'Merkur bedeckt Jupiter', leaf: true
                                    }, {
                                        id: 'Merkur bedeckt Mars',
                                        text: 'Merkur bedeckt Mars', leaf: true
                                    }, {
                                        id: 'Merkur bedeckt Saturn',
                                        text: 'Merkur bedeckt Saturn', leaf: true
                                    }]
                                },{
                                    text: 'Andere Planetenkonstellationen', expanded: true, children: [{
                                        id: 'Dreifache Konjunktion Jupiter & Saturn / Jupiter & Uranus',
                                        text: 'Dreifache Konjunktion Jupiter & Saturn / Jupiter & Uranus', leaf: true
                                    }, {
                                        id: '7 Planeten fast in einer Linie',
                                        text: '7 Planeten fast in einer Linie', leaf: true
                                    }]
                                }]
                            },
                            /*listeners: {
                             itemclick: function(view, rec, item, index, eventObj) {
                             currentMapId = rec.get('id');
                             sendMessage({method: 'loadMap', id: rec.get('id')});
                             }
                             }*/
                        }]
                    }]
            });


            // PLANETS' WEST PANEL (AT RIGHT)


            // get a reference to the HTML element with id "hideit" and add a click listener to it
            Ext.get("hideit").on('click', function(){
                // get a reference to the Panel that was created with id = 'west-panel'
                var w = Ext.getCmp('west-panel');
                // expand or collapse that Panel based on its collapsed property state
                w.collapsed ? w.expand() : w.collapse();
            });



            // wrapped in closure to prevent global vars.
            Ext.define('Planet System', {
                extend: 'Ext.data.Model',
                fields: ['name', 'planet']
            });


            var restaurants = Ext.create('Ext.data.Store', {
                storeId: 'restaraunts',
                model: 'Planet System',
                groupers: [{ property: 'planet', sorterFn: function(o1, o2){} }],
                data: [{
                    name: 'Sun',
                    planet: 'Sun'
                },{
                    name:'Mercury',
                    planet: 'Mercury'
                },{
                    name: 'Venus',
                    planet: 'Venus'
                },{
                    name:'Earth',
                    planet: 'Earth'
                },{
                    name: 'Moon',
                    planet: 'Earth'
                },{
                    name: 'Mars',
                    planet: 'Mars'
                },{
                    name: 'Jupiter',
                    planet: 'Jupiter'
                },{
                    name: 'Io',
                    planet: 'Jupiter'
                },{
                    name: 'Europa',
                    planet: 'Jupiter'
                },{
                    name: 'Ganymed',
                    planet: 'Jupiter'
                },{
                    name: 'Kallisto',
                    planet: 'Jupiter'
                },{
                    name: 'Saturn',
                    planet: 'Saturn'
                },{
                    name:'Mimas',
                    planet: 'Saturn'
                },{
                    name: 'Enceladus',
                    planet: 'Saturn'
                },{
                    name: 'Tethys',
                    planet: 'Saturn'
                },{
                    name: 'Dione',
                    planet: 'Saturn'
                },{
                    name: 'Rhea',
                    planet: 'Saturn'
                },{
                    name: 'Titan',
                    planet: 'Saturn'
                },{
                    name: 'Hyperion',
                    planet: 'Saturn'
                },{
                    name: 'Iapetus',
                    planet: 'Saturn'
                },{
                    name: 'Uranus',
                    planet: 'Uranus'
                },{
                    name: 'Ariel',
                    planet: 'Uranus'
                },{
                    name: 'Umbriel',
                    planet: 'Uranus'
                },{
                    name: 'Titania',
                    planet: 'Uranus'
                },{
                    name: 'Oberon',
                    planet: 'Uranus'
                },{
                    name: 'Miranda',
                    planet: 'Uranus'
                },{
                    name: 'Neptune',
                    planet: 'Neptune'
                },{
                    name: 'Triton',
                    planet: 'Neptune'
                },{
                    name: 'Nereid',
                    planet: 'Neptune'
                },{
                    name: 'Proteus',
                    planet: 'Neptune'
                },{
                    name: 'Ceres',
                    planet: 'Dwarf Planets'
                },{
                    name: 'Eris',
                    planet: 'Dwarf Planets'
                },{
                    name: 'Makemake',
                    planet: 'Dwarf Planets'
                },{
                    name: 'Pluto',
                    planet: 'Dwarf Planets'
                },{
                    name:'Charon',
                    planet:'Dwarf Planets'
                },{
                    name: 'Haumea',
                    planet: 'Dwarf Planets'
                },{
                    name:"Hi'iaka",
                    planet:'Dwarf Planets'
                }],
                listeners: {
                    groupchange: function(store, groupers) {
                        var grouped = restaurants.isGrouped(),
                            groupBy = groupers.items[0] ? groupers.items[0].property : '',
                            toggleMenuItems, len, i = 0;

                        // Clear grouping button only valid if the store is grouped
                        grid.down('[text=Clear Grouping]').setDisabled(!grouped);

                        // Sync state of group toggle checkboxes
                        if (grouped && groupBy === 'planet') {
                            toggleMenuItems = grid.down('button[text=Toggle groups...]').menu.items.items;
                            for (len = toggleMenuItems.length; i < len; i++) {
                                toggleMenuItems[i].setChecked(groupingFeature.isExpanded(toggleMenuItems[i].text));
                            }
                            grid.down('[text=Toggle groups...]').enable();
                        } else {
                            grid.down('[text=Toggle groups...]').disable();
                        }
                    }
                }
            });

            var groupingFeature = Ext.create('Ext.grid.feature.Grouping', {
                    groupHeaderTpl: ' {name}',
                    hideGroupedHeader: true,
                    startCollapsed: true,
                    id: 'restaurantGrouping'
                }),
                groups = restaurants.getGroups(),
                len = groups.length, i = 0,
                toggleMenu = [],
                toggleGroup = function(item) {
                    var groupName = item.text;
                    if (item.checked) {
                        groupingFeature.expand(groupName, true);
                    } else {
                        groupingFeature.collapse(groupName, true);
                    }
                };

            // Create checkbox menu items to toggle associated groupd
            for (; i < len; i++) {
                toggleMenu[i] = {
                    xtype: 'menucheckitem',
                    text: groups[i].name,
                    handler: toggleGroup
                }
            }

            var grid = Ext.create('Ext.grid.Panel', {
                renderTo: Ext.getBody(),
                collapseDirection: 'left',
                collapsible: true,
                iconCls: 'icon-grid',
                frame: true,
                store: restaurants,
                width: 160,
                height: '100%',
                title: 'Planets',
                resizable: true,
                features: [groupingFeature],

                /* Menu with checkboxes for grouping
                 tbar: ['->', {
                 text: 'Toggle groups...',
                 menu: toggleMenu
                 }],*/


                // Keep checkbox menu items in sync with expand/collapse
                viewConfig: {
                    listeners: {
                        /*groupcollapse: function(v, n, groupName) {
                         if (!grid.down('[text=Toggle groups...]').disabled) {
                         grid.down('menucheckitem[text=' + groupName + ']').setChecked(false, true);
                         }
                         },
                         groupexpand: function(v, n, groupName) {
                         if (!grid.down('[text=Toggle groups...]').disabled) {
                         grid.down('menucheckitem[text=' + groupName + ']').setChecked(true, true);
                         }
                         },*/
                        itemclick: function(dv, record, item, index, e) {
                            var name = record.get('name');
                            var planet = record.get('planet');

                            if(name == 'Sun'){
                                PS.showAll();
                                return;
                            }
                            if(name == planet || planet == 'Dwarf Planets'){
                                PS.showPlanet(name);
                                return;
                            }
                            else{
                                PS.showMoon(planet,name);
                            }


                        }
                    }
                },


                columns: [{
                    flex: 1,
                    dataIndex: 'name'
                },{
                    flex: 1,
                    dataIndex: 'planet'
                }]
            });

            Ext.create('Ext.slider.Single', {
                region: 'south',
                renderTo: 'basic-slider',
                width: 250,
                minValue: 0,
                hideLabel: true,
                useTips: false,
                maxValue: 100,
                value: 50
            });


        });
    }
});
