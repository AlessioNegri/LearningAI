import { TimeUnit, TitleOptions } from "chart.js";

// >>> Prepare the Chart.js options
export function chart_js_options(title: string = "Machine Learning - Regression", y_label: string = "Y-Axis Title"): any
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
        fullSize: true,
        padding: 10,
        text: title,
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
                position: "right",
                align: "start"
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
                    text: "Year",
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
                    color: "#FFFFFF40",
                },
                type: "time" as const,
                time:
                {
                    unit: "year" as TimeUnit,
                    parser: "yyyy-MM-dd",
                    displayFormats:
                    {
                        day:"yyyy-MM-dd"
                    }
                },
                ticks:
                {
                    //stepSize: 5,
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
                    //stepSize: 100,
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