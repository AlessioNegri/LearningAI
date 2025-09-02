import { TitleOptions } from 'chart.js';

// >>> Prepare the Chart.js options
export function chart_js_options(title: string = 'Penguins',
                                 x_label: string = 'Culmen Length [mm]',
                                 y_label: string = 'Culmen Depth [mm]'): any
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
                        size: 24,
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
            },
            zoom:
            {
                zoom:
                {
                    mode: 'xy',
                    wheel:
                    {
                        enabled: true
                    },
                    drag:
                    {
                        enabled: true,
                        borderWidth: 3,
                        borderColor: 'rgb(0, 255, 0)',
                        backgroundColor: 'rgba(0, 255, 0, 0.1)'
                    }
                },
                pan:
                {
                    enabled: true,
                    mode: 'xy',
                    modifierKey: 'ctrl'
                }
            }
        },
        scales:
        {
            x:
            {
                title:
                {
                    display: true,
                    text: x_label,
                    align: 'center',
                    color: 'rgb(255, 255, 255)',
                    font:
                    {
                        family: 'sans-serif',
                        size: 24
                    },
                    padding:
                    {
                        top: 15,
                        bottom: 15,
                        left: 0,
                        right: 0,
                    }
                },
                grid:
                {
                    display: true,
                    color: '#FFFFFF40'
                },
                ticks:
                {
                    color: 'rgb(255, 255, 255)',
                    font:
                    {
                        family: 'sans-serif',
                        size: 20
                    }
                }
            },
            y:
            {
                title:
                {
                    display: true,
                    text: y_label,
                    align: 'center',
                    color: 'rgb(255, 255, 255)',
                    font:
                    {
                        family: 'sans-serif',
                        size: 20
                    },
                    padding:
                    {
                        top: 0,
                        bottom: 30,
                        left: 0,
                        right: 0,
                    }
                },
                grid:
                {
                    display: true,
                    color: '#FFFFFF40'
                },
                ticks:
                {
                    color: 'rgb(255, 255, 255)',
                    font:
                    {
                        family: 'sans-serif',
                        size: 20
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