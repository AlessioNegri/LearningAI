import { TimeUnit, TitleOptions } from 'chart.js';

// >>> Prepare the Chart.js options
export function chart_js_options(title: string = 'Machine Learning - Regression',
                                 y_label: string = 'Y-Axis Title'): any
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
    };

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
                position: 'right',
                align: 'start',
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
                    text: 'Year',
                    align: 'center',
                    color: 'rgb(255, 255, 255)',
                    font:
                    {
                        family: 'sans-serif',
                        size: 24
                    },
                    padding:
                    {
                        top: 30,
                        bottom: 0,
                        left: 0,
                        right: 0
                    }
                },
                grid:
                {
                    display: true,
                    color: '#FFFFFF40',
                },
                type: 'time' as const,
                time:
                {
                    unit: 'year' as TimeUnit,
                    parser: 'yyyy-MM-dd',
                    displayFormats:
                    {
                        day: 'yyyy-MM-dd'
                    }
                },
                ticks:
                {
                    //stepSize: 5,
                    color: 'rgb(255, 255, 255)',
                    font:
                    {
                        family: 'sans-serif',
                        size: 20
                    }
                },
                parsing: false,
                min:'2002-01-01',
                max:'2024-01-01'
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
                        right: 0
                    }
                },
                grid:
                {
                    display: true,
                    color: '#FFFFFF40'
                },
                ticks:
                {
                    //stepSize: 100,
                    color: 'rgb(255, 255, 255)',
                    font:
                    {
                        family: 'sans-serif',
                        size: 20
                    }
                }
            }
        }
    };

    // * Return

    return options
}