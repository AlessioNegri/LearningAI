import { TitleOptions } from "chart.js";

// >>> Prepare the Chart.js options
export function chart_js_options(title: string = "Penguins",
                                 x_label: string = "Culmen Length [mm]",
                                 y_label: string = "Culmen Depth [mm]"): any
{
    // * Title

    const plugins_title : TitleOptions =
    {
        align: "center",
        display: true,
        position: "top",
        color: "rgb(255, 255, 255)",
        font:
        {
            family: "Arial",
            size: 20,
        },
        fullSize: false,
        padding: 10,
        text: title
    }

    // * Options

    const options : any =
    {
        responsive: true,
        maintainAspectRatio: false,
        plugins:
        {
            legend:
            {
                labels:
                {
                    color: "rgb(255, 255, 255)",
                    font:
                    {
                        family: "Arial",
                        size: 18,
                    },
                },
                position: "bottom",
                align: "center"
            },
            title: plugins_title,
            zoom:
            {
                zoom:
                {
                    mode: "xy",
                    wheel:
                    {
                        enabled: true
                    },
                    drag:
                    {
                        enabled: true,
                        borderColor: "rgb(54, 162, 235)",
                        borderWidth: 1,
                        backgroundColor: "rgba(54, 162, 235, 0.3)"
                    }
                },
                pan:
                {
                    enabled: true,
                    mode: "xy",
                    modifierKey: "ctrl"
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
                    align: "center",
                    text: x_label,
                    color: "rgb(255, 255, 255)",
                    font: {
                        family: "Arial",
                        size: 14,
                        weight: "bold",
                    },
                    padding:
                    {
                        top: 10,
                        bottom: 5,
                        left: 0,
                        right: 0,
                    }
                },
                grid:
                {
                    display: true,
                    color: "#FFFFFF40"
                },
                ticks:
                {
                    color: "rgb(255, 255, 255)",
                    font:
                    {
                        family: "Nunito",
                        size: 16
                    }
                }
            },
            y:
            {
                title:
                {
                    display: true,
                    align: "center",
                    text: y_label,
                    color: "rgb(255, 255, 255)",
                    font:
                    {
                        family: "Arial",
                        size: 14,
                        weight: "bold",
                    },
                    padding:
                    {
                        top: 10,
                        bottom: 5,
                        left: 0,
                        right: 0,
                    }
                },
                grid:
                {
                    display: true,
                    color: "#FFFFFF40"
                },
                ticks:
                {
                    color: "rgb(255, 255, 255)",
                    font:
                    {
                        family: "Nunito",
                        size: 16
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