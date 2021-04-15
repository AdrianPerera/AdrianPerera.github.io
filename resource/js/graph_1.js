function dateConverter(match, p1, p2, p3, offset, string) {
    var mS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    p2 = mS[parseInt(p2) - 1];
    p1 = "20" + p1;
    return [p2, p3, p1].join(' ');
}

fetch('bitcoin.json')
    .then(res => res.json())
    .then(data => {
        const chart = new G2.Chart({
            container: 'container',
            autoFit: true,
            height: 450,
            padding: [40, 45, 80, 80],
            animate: false
        });

        const ds = new DataSet({
            state: {
                start: '14-10-13',
                end: '21-02-26',
            }
        });

        const dv = new DataSet.DataView().source(data);
        dv.transform({
            type: 'filter',
            callback(row) {
                const date = row.date;
                return date >= ds.state.start && date <= ds.state.end;
            }
        });
        chart.data(dv.rows);
        chart.axis('date', {
            label: {
                formatter: text => {
                    return text.replace(/(\d{2})-(\d{2})-(\d{2})/g, dateConverter);
                }
            }
        });

        chart.axis('value', {
            label: {
                formatter: text => {
                    if (text === "0") {
                        return "0";
                    } else {
                        return "$" + text.substr(0, text.length - 3) + "k";
                    }
                }
            }
        });

        chart.scale({
            date: {
                tickCount: 8
            },
            value: {
                type: 'linear',
                tickCount: 8,
            }
        });

        chart.legend({
            custom: true,
            items: [
                { name: 'crypto', value: 'value', marker: { symbol: 'line', style: { stroke: '#1890ff', lineWidth: 1 } } },

            ],
        });

        chart.tooltip({
            position: 'right',
            crosshairs: {
                type: 'y'
            },
            title: (title, datum) =>
                datum['date'].replace(/(\d{2})-(\d{2})-(\d{2})/g, dateConverter),
            customItems: (items) => {
                let val = parseInt(items[0].value);
                items[0].value = "$ " + val;
                return items;
            },
        });
        chart.option('slider', {
            start: 0,
            end: 1,
            height:25,
            trendCfg: {
              isArea: false,
            },
            padding:[20,0,0,0],
            formatter:(value) =>{
                return value.replace(/(\d{2})-(\d{2})-(\d{2})/g, dateConverter);
            } 
          });
      

        chart.line().position('date*value').color('#1890ff').size(1);
        chart.interaction('element-visible-filter');
        chart.interaction('brush-x')
        chart.render();



        // const sliderChart = new G2.Chart({
        //     container: 'container2',
        //     autoFit: true,
        //     height: 70,
        //     padding: [10, 45, 30, 60],
        //     animate: false
        // })
        // sliderChart.data(data)
        // sliderChart.scale({
        //     date: {
        //         tickCount: 10
        //     },
        //     value: {
        //         type: 'linear'
        //     }
        // })

        // sliderChart.axis('date', {
        //     label: {
        //         formatter: text => {
        //             return text.replace(/(\d{2})-(\d{2})-(\d{2})/g, function year(match, p1) {
        //                 p1 = "20" + p1;
        //                 return p1;
        //             });
        //         }
        //     }
        // });
        // G2.registerInteraction('brush-x', {
        //     showEnable: [
        //       { trigger: 'plot:mouseenter', action: 'cursor:crosshair' },
        //       { trigger: 'plot:mouseleave', action: 'cursor:default' },
        //     ],
        //     start: [
        //       {
        //         trigger: 'plot:mousedown',
        //         action: ['rect-mask:start', 'rect-mask:show', 'element-range-highlight:start'],
        //       },
        //     ],
        //     processing: [
        //       {
        //         trigger: 'plot:mousemove',
        //         action: ['rect-mask:resize', 'element-range-highlight:highlight'],
        //       },
        //       { trigger: 'mask:end', action: ['element-filter:filter'] },
        //     ],
        //     end: [
        //       {
        //         trigger: 'plot:mouseup',
        //         action: ['rect-mask:end', 'rect-mask:hide', 'element-range-highlight:end', 'element-range-highlight:clear'],
        //       },
        //     ],
        //     rollback: [
        //       {
        //         trigger: 'dblclick',
        //         action: ['element-filter:clear'],
        //       },
        //     ],
        //   });

        // sliderChart.tooltip(false);
        // sliderChart.axis('value', false);
        // sliderChart.area().position('date*value').color('red');
        // sliderChart.render();
        // sliderChart.interaction('brush-x')


    });
