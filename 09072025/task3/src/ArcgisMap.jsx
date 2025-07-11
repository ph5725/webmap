import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LuMonitor } from 'react-icons/lu';
import { LuMinimize } from 'react-icons/lu';

function PrivatePortalMap() {
  const mapRef = useRef(null);
  const [showInterface, setShowInterface] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const viewRef = useRef(null);

  useEffect(() => {
    const loadMap = async () => {
      const [WebMap, MapView, Portal, esriConfig, Legend, BasemapGallery, BasemapToggle, Home] = await Promise.all([
        import('@arcgis/core/WebMap'),
        import('@arcgis/core/views/MapView'),
        import('@arcgis/core/portal/Portal'),
        import('@arcgis/core/config'),
        import('@arcgis/core/widgets/Legend'),
        import('@arcgis/core/widgets/BasemapGallery'),
        import('@arcgis/core/widgets/BasemapToggle'),
        import('@arcgis/core/widgets/Home'),
        import('@arcgis/core/assets/esri/themes/light/main.css')
      ]);

      esriConfig.default.portalUrl = "https://iotplatform.intelli.com.vn/portal";

      const portal = new Portal.default({
        url: "https://iotplatform.intelli.com.vn/portal",
        authMode: "auto"
      });

      await portal.load();

      const webmap = new WebMap.default({
        portalItem: {
          id: "d59152f99b2e4369b6b0bacad0397a74",
          portal: portal
        }
      });

      try {
        await webmap.load();
        
        const view = new MapView.default({
          container: mapRef.current,
          map: webmap,
          spatialReference: { wkid: 102100 }
        });

        viewRef.current = view;

        await view.when();
        console.log("Map loaded successfully");
        setMapLoaded(true);

        // Thêm Legend
        const legend = new Legend.default({
          view: view,
          style: { type: "card", background: "rgba(255,255,255,0.8)" }
        });
        view.ui.add(legend, "bottom-right");
        legend.container.style.padding = "10px";
        legend.container.style.maxHeight = "500px";
        legend.container.style.overflowY = "auto";
        legend.container.classList.add('toggleable-ui');

        // Thêm Basemap Gallery
        const basemapGallery = new BasemapGallery.default({
          view: view,
          container: document.createElement("div"),
          source: {
            query: {
              title: '"World Basemaps for Developers" AND owner:esri'
            }
          }
        });
        view.ui.add(basemapGallery, "top-right");
        basemapGallery.container.style.padding = "10px";
        basemapGallery.container.style.maxHeight = "400px";
        basemapGallery.container.style.overflowY = "auto";
        basemapGallery.container.classList.add('toggleable-ui');

        // Thêm Basemap Toggle (luôn hiển thị)
        const basemapToggle = new BasemapToggle.default({
          view: view,
          nextBasemap: "satellite"
        });
        view.ui.add(basemapToggle, "top-right");

        // Thêm Home widget (luôn hiển thị)
        const homeWidget = new Home.default({
          view: view
        });
        view.ui.add(homeWidget, "top-left");

      } catch (error) {
        console.error("Failed to load map:", error);
      }
    };

    loadMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.innerHTML = '';
      }
    };
  }, []);

  // Hiệu ứng toggle interface
  const toggleInterface = () => {
    const newState = !showInterface;
    setShowInterface(newState);
    
    // Ẩn/hiện các widget UI
    const widgets = document.querySelectorAll('.toggleable-ui');
    widgets.forEach(widget => {
      widget.style.display = newState ? "block" : "none";
    });
    
    // Ẩn/hiện header
    const header = document.querySelector('.map-header');
    if (header) {
      header.style.display = newState ? "flex" : "none";
    }
    
    // Điều chỉnh kích thước map
    if (mapRef.current) {
      mapRef.current.style.height = newState ? "calc(100vh - 60px)" : "100vh";
    }
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      {/* Tiêu đề - có thể ẩn */}
      <div 
        className="map-header"
        style={{ 
          padding: '10px', 
          background: '#f5f5f5', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #ddd',
          height: '60px'
        }}
      >
        <h2 style={{ margin: 0 }}>Bản đồ hệ thống IoT</h2>
      </div>
      
      {/* Nút ẩn/hiện dạng icon */}
      {mapLoaded && (
        <button 
          onClick={toggleInterface}
          style={{
            padding: '10px',
            background: 'rgba(255,255,255,0.9)',
            color: '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            position: 'fixed',
            left: '20px',
            bottom: '20px',
            zIndex: 1000,
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px'
          }}
          title={showInterface ? 'Ẩn giao diện' : 'Hiện giao diện'}
        >
          {/* Biểu tượng menu hoặc eye */}
          {showInterface ? (
            <span style={{ fontSize: '10px' }}><LuMonitor size={20} color="333" /></span> // Biểu tượng con mắt khi đang hiện
          ) : (
            <span style={{ fontSize: '10px' }}><LuMinimize size={20} color="#333" /></span> // Biểu tượng menu khi đang ẩn
          )}
        </button>
      )}
      
      {/* Khu vực hiển thị map */}
      <div 
        ref={mapRef} 
        style={{ 
          height: '90%', 
          width: '100%',
          transition: 'height 0.3s ease'
        }} 
      />
    </div>
  );
}

export default PrivatePortalMap;