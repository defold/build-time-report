import FlameChart from 'flame-chart-js';

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
        settings: {
            options: {
                tooltip: () => {/*...*/ }, // see section "Custom Tooltip" below
                timeUnits: 'ms'
            },
            styles: {} // see section "Styles" below
        }
    });
    const nodeView : any = document.getElementById('selected-node');
    flameChart.on('select', (node: any, type: any) => {
        nodeView.innerHTML = (node ? `${type}\r\n${JSON.stringify({
            ...node,
            source: {
                ...node.source,
                children: '[]',
            },
            parent: undefined
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

    window.addEventListener('resize', () => {
        flameChart.resize(...getWrapperWH());
    });
}

(window as any).createChart = createChart;
