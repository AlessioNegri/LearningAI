import { TitleOptions, Tooltip } from 'chart.js';

// >>> Prepare the Chart.js options
export function chart_js_options(title: string = 'Market Basket'): any
{
    // * Title

    const plugins_title : TitleOptions =
    {
        text: title,
        align: 'center',
        position: 'top',
        color: 'rgb(255, 255, 255)',
        display: true,
        fullSize: true,
        padding: 10,
        font:
        {
            family: 'sans-serif',
            size: 30,
            weight: 'bold'
        }
    }

    // * Options

    const options : any =
    {
        responsive: true,
        maintainAspectRatio: false,
        plugins:
        {
            title: plugins_title,
            legend:
            {
                position: 'bottom',
                align: 'center',
                labels:
                {
                    color: 'rgb(255, 255, 255)',
                    font:
                    {
                        family: 'sans-serif',
                        size: 0,
                        weight: 'italic'
                    }
                }
            },
            tooltip:
            {
                titleFont:
                {
                    family: 'sans-serif',
                    size: 20,
                },
                bodyFont:
                {
                    family: 'sans-serif',
                    size: 20,
                }
            }
        },
        scales:
        {
            r:
            {
                grid:
                {
                    display: true,
                    color: '#FFFFFF80'
                },
                ticks:
                {
                    color: 'rgb(255, 255, 255)',
                    backdropColor: 'rgb(255, 255, 255, 0)',
                    font:
                    {
                        family: 'sans-serif',
                        size: 24
                    }
                },
                pointLabels:
                {
                    display: true,
                    centerPointLabels: true,
                    color: '#7bf1a8',
                    backdropColor: '#024a71',
                    borderRadius: 10,
                    font:
                    {
                        family: 'Nunito',
                        size: 24,
                        weight: 'bold'
                    }
                }
            }
        }
    }

    // * Return

    return options
}

// >>> Generate a random color string
export function getRandomColor()
{
    var letters = '0123456789ABCDEF';

    var color = '#';

    for (var i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
    
    return color;
}