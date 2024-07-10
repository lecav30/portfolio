"use client";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { SpecialZoomLevel } from "@react-pdf-viewer/core";

const PDFViewer = (props: any) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  return (
    <div className="h-screen w-screen">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer
          fileUrl={props.file}
          plugins={[defaultLayoutPluginInstance]}
          defaultScale={SpecialZoomLevel.PageFit}
        />
      </Worker>
    </div>
  );
};

export default PDFViewer;
