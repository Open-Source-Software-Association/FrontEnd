declare module 'vue-echarts' {
    import { DefineComponent } from 'vue';
    const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
    export { component as VueECharts };
}
