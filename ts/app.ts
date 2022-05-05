import FlameChart from 'flame-chart-js';

window.onload = function () {
    const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;

    canvas.width = 800;
    canvas.height = 400;

    const flameChart = new FlameChart({
        canvas, // mandatory
        data: [
            {
                name: 'foo',
                start: 300,
                duration: 200,
                type: 'task',
                children: [
                    {
                        name: 'foo',
                        start: 310,
                        duration: 50,
                        type: 'sub-task',
                        color: '#AA0000'
                    }
                ]
            }
        ],
        marks: [
            {
                shortName: 'DCL',
                fullName: 'DOMContentLoaded',
                timestamp: 500
            }
        ],
        colors: {
            'task': '#FFFFFF',
            'sub-task': '#000000'
        },
        settings: {
            options: {
                tooltip: () => {/*...*/ }, // see section "Custom Tooltip" below
                timeUnits: 'ms'
            },
            styles: {} // see section "Styles" below
        }
    });

    flameChart.on('select', (node: any, type: any) => {
        /*...*/
    });
}
