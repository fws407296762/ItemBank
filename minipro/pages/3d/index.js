// pages/3d/index.js
import {createScopedThreejs} from "../../miniprogram_npm/threejs-miniprogram/index";
import registerOrbit from "../../miniprogram_npm/threejs-miniprogram/orbit";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canvas:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const query = wx.createSelectorQuery();
    query.select("#cas").node().exec((res)=>{
      const canvas = res[0].node;
      this.canvas = canvas;
      const THREE = createScopedThreejs(canvas);
      let systemInof = wx.getSystemInfoSync();
      let wW = canvas.width;
      let wH = canvas.height;

      // 场景
      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#f0f0f0");

      //相机
      const camera = new THREE.PerspectiveCamera(100,wW / wH,0.25,1000);

      // ground
      const grid = new THREE.GridHelper(200,100,"#000000","#000000")
      grid.material.opacity = 0.2;
      grid.material.transparent = true;
      scene.add(grid);

      //渲染器
      const renderer = new THREE.WebGLRenderer({
        antialias:true
      });
      renderer.setPixelRatio(wx.getSystemInfoSync().pixelRatio);
      renderer.setSize(wW,wH);
      
      //头
      var headGeometry = new THREE.SphereGeometry(10, 32, 32,0,3.14*2,0,Math.PI * 0.72);
      var headMaterial = new THREE.MeshBasicMaterial({ 
        color: "#1f72df",
        wireframe:true
      });
      let headCube = new THREE.Mesh(headGeometry, headMaterial);
      
      //脸
      var faceShape = new THREE.Shape();
      let x = 0,y = 0;
      faceShape.moveTo(8,6);
      const splinepts = [];
				splinepts.push( new THREE.Vector3( 8, 0,0) );
				splinepts.push( new THREE.Vector3( 10, 0,0) );
				splinepts.push( new THREE.Vector3( 12, 0,0) );
				splinepts.push( new THREE.Vector3( 8, 0,2.5) );
				splinepts.push( new THREE.Vector3( 10, 0,2.5) );
        splinepts.push( new THREE.Vector3( 12, 0,2.5) );
        splinepts.push( new THREE.Vector3( 8, 0,5) );
				splinepts.push( new THREE.Vector3( 10, 0,5) );
				splinepts.push( new THREE.Vector3( 12, 0,5) );
        faceShape.splineThru(splinepts)
      let faceGeometry = new THREE.ParametricGeometry(25,25,radialWave);
      let faceMaterial = new THREE.MeshPhongMaterial({
        color:0x3399ff,
        shininess: 40, 
        specular: 0xaaaafff, 
        side: THREE.DoubleSide
      });
      let faceMesh = new THREE.Mesh(faceGeometry,faceMaterial);
      function radialWave(u, v) {
        var r = 50;
        var x = Math.sin(u) * r;
        var z = Math.sin(v / 2) * 2 * r;
        var y = ( Math.sin(u * 4 * Math.PI) + Math.cos(v * 2 * Math.PI) ) * 2.8;
        return new THREE.Vector3(x, y, z);
      }
    
      //眼睛
      var eyeGeometry = new THREE.SphereGeometry(2, 32, 32);
      var eyedMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        wireframe:true
      });
      let eyeLeftCube = new THREE.Mesh(eyeGeometry, eyedMaterial);
      let eyeRightCube = new THREE.Mesh(eyeGeometry, eyedMaterial);
      eyeLeftCube.position.set(5,5,5);
      eyeRightCube.position.set(5,5,-5);

      let group = new THREE.Group();
      group.add(headCube);
      group.add(faceMesh);
      group.add(eyeLeftCube);
      group.add(eyeRightCube);
      scene.add(group);
      //添加坐标
      const axesHelper = new THREE.AxesHelper(20);
      scene.add(axesHelper);

      const {OrbitControls} = registerOrbit(THREE);
      const orbitControls = new OrbitControls(camera, renderer.domElement);
      camera.position.set( 5, 5, 20 );
      orbitControls.update();
      animate();

      function animate() {
        canvas.requestAnimationFrame(animate);
        orbitControls.update()
        renderer.render(scene, camera);
      }

    })
  },
  touchStart(e) {
    this.canvas.dispatchTouchEvent({...e, type:'touchstart'})
  },
  touchMove(e) {
    this.canvas.dispatchTouchEvent({...e, type:'touchmove'})
  },
  touchEnd(e) {
    this.canvas.dispatchTouchEvent({...e, type:'touchend'})
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})