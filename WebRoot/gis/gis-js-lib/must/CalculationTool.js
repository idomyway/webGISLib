/**
 * Created by cuiweikang on 2017/6/6.
 */
/**
 * @summary 提供各种地图操作的方法
 * @module must/CalculationTool
 * @example require(["must/CalculationTool"],function(alculationTool){     });
 */
define([
    "esri/geometry/Circle",
    "esri/geometry/geometryEngine",
    "esri/tasks/GeometryService"

],function(
    Circle,
    geometryEngine,
    GeometryService


)
{
    var obj = declare([Navigation],{
        _map:null,
        /**
         * @memberOf module:must/CalculationTool#
         * @constructor CalculationTool
         * @param {Object} map -有关地图计算的工具类
         * @example var CalculationTool=new CalculationTool({map|null})
         */
        constructor: function(map){
            var me = this;
            me._map=map;

        },
        /**
         * @description 根据点的xy坐标生成圆，半径默认米
         * @param {Number} x    -点的X坐标
         * @param {Number} y    -点的y坐标
         * @param {Number} radius   -圆的半径（单位米）
         * @returns {Object} circle  -返回生成的圆
         */
        pointToCircle:function(x,y,radius){

            var circle =new Circle({
                center:[x,y],
                radius:radius
                }
            );
            return circle;

        },
        /**
         *
         * @param {Object} geometry1
         * @param {Object} geometry2
         * @param {Boolean} callBack
         */
        intersects:function(geometry1, geometry2,callBack){

        },
        /**
         *
         * @param {Object} geometry1
         * @param {Object} geometry2
         * @returns {Boolean}
         */
        geometryEngineIntersects:function(geometry1,geometry2){
            return geometryEngine.intersects(geometry1,geometry2);
        },
        /**
         *@description -求两要素之间的最近距离
         * @param {Geometry} geometry1 -输入要比较距离的要素对象1
         * @param {Geometry} geometry2 -输入要比较距离的要素对象2
         * @returns {Number} -返回两点之间的距离，单位默认米
         */
        geometryEngineDistance:function(geometry1,geometry2){
            return geometryEngineDistance(geometry1, geometry2, "meters");
        },

        GenerateGeometryByType:function(object,Type){
            var geometry=null;
            if(typeof(object) == "string"){
                geometry=eval("("+object+")");
            }
            if(type=="Polyline"){
                geometry= new Polyline(geometry);
            }
            if(type=="Polygon"){
                geometry = new Polygon(geometry);
            }

        }







    });
    return obj;
});