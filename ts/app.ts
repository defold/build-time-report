import FlameChart from 'flame-chart-js';
import 'datatables.net-dt/css/jquery.datatables.css';
var $  = require( 'jquery' );
import 'datatables.net-dt';

function recurciveTableDataCreationd(data:any, finalData:any) : any {
    data.forEach((el : any) => {
        if (el.output) {
            if (!finalData[el.output]) {
                finalData[el.output] = {};
            }
            if (!finalData[el.output][el.type]) {
                finalData[el.output][el.type] = {};
            }
            finalData[el.output][el.type]["duration"] = el.duration;
            finalData[el.output][el.type]["start"] = el.start;
            if (!finalData[el.output]["duration"]) {
                finalData[el.output]["duration"] = 0;
            }
            finalData[el.output]["duration"] += el.duration;
            finalData[el.output]["name"] = el.name;
        }
        if (el.children) {
            recurciveTableDataCreationd(el.children, finalData);
        }
    });
}

function getTableData(data : any) : any {
    var finalData:any = {};
    recurciveTableDataCreationd(data, finalData);
    var result:any = [];
    var i = 0;
    for (let key in finalData) {
        let value = finalData[key];
        result[i] = {};
        result[i]["output"] = key;
        result[i]["createTimeMS"] = value["createTask"]["duration"];
        result[i]["createTime"] = value["createTask"]["duration"] / 1000;
        result[i]["createStart"] = value["createTask"]["start"]; 
        result[i]["buildTimeMS"] = value["buildTask"]["duration"];
        result[i]["buildTime"] = value["buildTask"]["duration"] / 1000;
        result[i]["buildStart"] = value["buildTask"]["start"];
        result[i]["totalTime"] = value["duration"] / 1000;
        result[i]["name"] = value["name"];
        i++;
    }
    return result;
}

function formatTime(time: any) {
    return (time).toFixed(4);
}

function createChart(data: any, marks: any) {
    const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;

    const flameChart = new FlameChart({
        canvas,
        data: data,
        marks: marks,
        colors: {
            'task': '#FFFFFF',
            'sub-task': '#000000'
        },
        options: {
            timeUnits: 'ms'
        },
        styles: {}
    });
    const nodeView : any = document.getElementById('selected-node');
    flameChart.on('select', (node: any, type: any) => {
        nodeView.innerHTML = (node ? `${JSON.stringify({
            ...node,
            children: undefined,
            color:undefined,
            start:undefined,
            end:undefined,
            level:undefined,
            index:undefined,
            duration: node.duration ? node.duration/1000 +" sec" : undefined,
            parent: node.parent ? node.parent.name :undefined
        }, null, '  ')}` : '');
    });

    // resize
    const wrapper = document.getElementById('wrapper');
    const getWrapperWH = () => {
        const style = window.getComputedStyle(wrapper, null);
    
        return [
            parseInt(style.getPropertyValue('width')),
            parseInt(style.getPropertyValue('height')) - 3
        ];
    };
    const [width, height] = getWrapperWH();
    canvas.width = width;
    canvas.height = height;
    flameChart.resize(...getWrapperWH());
    var fullWith = width;

    window.addEventListener('resize', () => {
        const [width, height] = getWrapperWH();
        fullWith = width;
        flameChart.resize(width, height);
    });

    flameChart.setSettings({ 
            tooltip : (data : any, renderEngine : any, mouse : any) => {
                if (!mouse) 
                    return;
                var newMouse = {x:mouse.x, y:mouse.y};
                var fields = [  { text: (data.data.name || data.data.fullName) || ""},
                                { text: (data.data.duration || data.data.timestamp) + " ms" }
                             ];
                const maxWidth = fields
                    .map(({ text }) => text)
                    .map((text) => renderEngine.ctx.measureText(text))
                    .reduce((acc, { width }) => Math.max(acc, width), 0);
                const fullWidth = maxWidth + renderEngine.blockPaddingLeftRight * 2;
                if (newMouse.x + 10 + fullWidth > fullWith) {
                    newMouse.x = newMouse.x - 20 - fullWidth;
                }
                renderEngine.renderTooltipFromData(fields, newMouse);
            } 
      });
    
    const TOTAL_ROW_INDEX = 1;
    const CREATE_ROW_INDEX = 2;
    const BUILD_ROW_INDEX = 3;



    // Setup resource table
    var tableData:any = getTableData(data);
    var table = $('#resources-list').DataTable( {
        data: tableData,
        scrollX: true,
        fixedColumns: true,
        "footerCallback": function ( row : any, data : any, start : any, end : any, display : any ) {
            var api = this.api();
            var totalTime = api
                .column( TOTAL_ROW_INDEX, {search: 'applied'} )
                .data()
                .reduce( function (a:any, b:any) {
                    return a + b;
                }, 0 );

            var totalTimePage = api
                .column( TOTAL_ROW_INDEX, {search: 'applied',
                              page : 'current'} )
                .data()
                .reduce( function (a:any, b:any) {
                    return a + b;
                }, 0 );

            var createTotal = api
                .column( CREATE_ROW_INDEX, {search: 'applied'} )
                .data()
                .reduce( function (a:any, b:any) {
                    return a + b;
                }, 0 );

            var createTotalPage = api
                .column( CREATE_ROW_INDEX, {search: 'applied',
                              page : 'current'} )
                .data()
                .reduce( function (a:any, b:any) {
                    return a + b;
                }, 0 );

            var buildTotal = api
                .column( BUILD_ROW_INDEX, {search: 'applied'} )
                .data()
                .reduce( function (a:any, b:any) {
                    return a + b;
                }, 0 );

            var buildTotalPage = api
                .column( BUILD_ROW_INDEX, {search: 'applied',
                              page : 'current'} )
                .data()
                .reduce( function (a:any, b:any) {
                    return a + b;
                }, 0 );

            // Update time in footer
            $( api.column( 0 ).footer() ).html(
                "Page sec" + " <br>(Total sec)"
                );
            $( api.column( TOTAL_ROW_INDEX ).footer() ).html(
                formatTime(totalTimePage) + " <br>(" + formatTime(totalTime) + ")"
                );
            $( api.column( CREATE_ROW_INDEX ).footer() ).html(
                formatTime(createTotalPage) + " <br>(" + formatTime(createTotal) + ")"
                );
            $( api.column( BUILD_ROW_INDEX ).footer() ).html(
                formatTime(buildTotalPage) + " <br>(" + formatTime(buildTotal) + ")"
                );
        },

        columns: [
            { title: "Type", data: "name" },
            { title: "Total time sec", data: "totalTime" },
            { title: "Create Task sec", data: function ( row : any, type : any, val : any, meta : any ) {
                if (row.createTime === undefined) {
                    return "?";
                } else {
                    return row.createTime;
                }
                } },
            { title: "Build Task sec", data: "buildTime" },
            { title: "Output", data: "output" },
        ]
    } );
    const ZOOM_STEP = 1;
    $( '#resources-list' ).on( 'click', 'tbody td:not(:first-child)', function (e : any) {
        var index = $(this).closest('td').index();
        var rowData = table.row( this ).data();
        if ( index == CREATE_ROW_INDEX) {
            console.log(rowData["createStart"]);
            flameChart.setZoom(rowData["createStart"] -ZOOM_STEP, rowData["createStart"] + rowData["createTimeMS"] + ZOOM_STEP);
        } else if (index == BUILD_ROW_INDEX) {
            flameChart.setZoom(rowData["buildStart"] -ZOOM_STEP, rowData["buildStart"] + rowData["buildTimeMS"] + ZOOM_STEP);
        }
    } );

    $( '#resources-list' ).on( 'mouseenter', 'tbody td:not(:first-child)', function (e : any) {
        var index = $(this).closest('td').index();
        if (index == CREATE_ROW_INDEX || index == BUILD_ROW_INDEX) {
            e.target.style.cursor = "pointer";
        }
    });
}

(window as any).createChart = createChart;
