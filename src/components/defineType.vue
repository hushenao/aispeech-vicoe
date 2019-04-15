<template>
  <div id="define"></div>
</template>

<script>
  import G6 from '@antv/g6'
  const Util = G6.Util;
  export default {
    name: "define-type",
    data () {
      return {}
    },
    mounted () {
      this.createG6()
    },
    methods: {
      createG6 () {
        // 定义数据
        const data = {
          nodes: [{
            id: 'node1',
            x: 100,
            y: 200,
            label: '一个说明',
            shape: 'testKeyShape'
          },{
            id: 'node2',
            x: 300,
            y: 300,
            label: '另一个说明',
            shape: 'testKeyShape'
          }],
          edges: [{
            id: 'edge1',
            target: 'node2',
            source: 'node1',
            style: {
              endArrow: true,
              stroke: 'red'
            },
            shape: 'hvh'
          }]
        };
        // 自定义节点
        G6.registerNode('testKeyShape', {
          draw(cfg, group) {
            const circle = group.addShape('circle', {
              attrs: {
                x: 0,
                y: 0,
                r: 10,
                stroke: '#444',
                fill: '#ccc'
              }
            });
            const text = group.addShape('text', {
              attrs: {
                x: 0,
                y: -20,
                textAlign: 'center',
                text: cfg.label,
                fill: '#444'
              }
            });
            return circle;
          }
        });
        const graph = new G6.Graph({
          container: 'define',
          width: 500,
          height: 500,
          modes: {

          }
        });
        graph.read(data)
        G6.registerNode('testKeyShape', {
          // 设置状态
          setState(name, value, item) {
            const group = item.getContainer();
            const shape = group.get('children')[0]; // 顺序根据 draw 时确定
            if(name === 'running') {
              if(value) {
                shape.animate({
                  r: 20,
                  repeat: true
                }, 1000);
              } else {
                shape.stopAnimate();
                shape.attr('r', 10);
              }
            }
          }
        }, 'rect');
        G6.registerEdge('hvh', {
          draw(cfg, group) {
            const startPoint = cfg.startPoint;
            const endPoint = cfg.endPoint;
            const shape = group.addShape('path', {
              attrs: {
                stroke: 'pink',
                path: [
                  ['M', startPoint.x, startPoint.y],
                  ['L', endPoint.x / 3 + 2 / 3 * startPoint.x , startPoint.y],
                  ['L', endPoint.x / 3 + 2 / 3 * startPoint.x , endPoint.y],
                  ['L', endPoint.x, endPoint.y]
                ]
              }
            });
            return shape;
          }
        });
        G6.registerEdge('hvh', {
          afterDraw(cfg, group) {
            const shape = group.get('children')[0];
            const length = shape.getTotalLength(); // G 增加了 totalLength 的接口
            shape.animate({
              onFrame(ratio) {
                const startLen = ratio * length;
                const cfg = {
                  lineDash: [startLen, length - startLen]
                };
                return cfg;
              },
              repeat: true
            }, 2000);
          }
        }, 'line-growth');
        // 点击时选中，再点击时取消
        /*graph.on('node:click', ev=> {
          const node = ev.item;
          graph.setItemState(node, 'running', !node.hasState('running')); // 切换选中
        });*/
        // 鼠标移动到上面 running，移出结束
        graph.on('node:mouseenter', ev=> {
          const node = ev.item;
          graph.setItemState(node, 'running', true);
        });
        graph.on('node:mouseleave', ev=> {
          const node = ev.item;
          graph.setItemState(node, 'running', false);
        });
      }
    }
  }
</script>

<style scoped>

</style>
