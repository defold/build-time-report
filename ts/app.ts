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
        options: {
            timeUnits: 'ms'
        },
        styles: {}
    });
    const nodeView : any = document.getElementById('selected-node');
    flameChart.on('select', (node: any, type: any) => {
        nodeView.innerHTML = (node ? `${type}\r\n${JSON.stringify({
            ...node,
            children: undefined,
            color:undefined,
            start:undefined,
            end:undefined,
            level:undefined,
            index:undefined,
            duration: node.duration/1000 +" sec",
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
                var fields = [{ text: data.data.name }, { text: data.data.duration + " ms" }];
                const maxWidth = fields
                    .map(({ text }) => text)
                    .map((text) => renderEngine.ctx.measureText(text))
                    .reduce((acc, { width }) => Math.max(acc, width), 0);
                const fullWidth = maxWidth + renderEngine.blockPaddingLeftRight * 2;
                if (mouse.x + 10 + fullWidth > fullWith) {
                    mouse.x = mouse.x - 20 - fullWidth;
                }
                renderEngine.renderTooltipFromData(fields, mouse);
            } 
      });
}

(window as any).createChart = createChart;
