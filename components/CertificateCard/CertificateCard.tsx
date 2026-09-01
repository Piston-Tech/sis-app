"use client";

import apiClient from "@/services/apiClient";
import Certificate from "@/types/Certificate";
import { Download, LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const CertificateCard = ({
  courseTitle,
  issueDate,
  preview,
  download,
  owing,
  issued,
}: Certificate) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const disabled = owing || !issued;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // 1. Fetch the data from your API or external URL
      const response = await apiClient.get(download, {
        responseType: "blob", // <-- Tells Axios to preserve the raw binary data stream
      });

      //   const dataString = response.data;

      //   // 1. Convert the string characters into a typed binary array
      //   const elementCount = dataString.length;
      //   const byteArray = new Uint8Array(elementCount);

      //   for (let i = 0; i < elementCount; i++) {
      //     byteArray[i] = dataString.charCodeAt(i) & 0xff;
      //   }

      //   // 2. Create the working PDF Blob from the array
      //   const blob = new Blob([byteArray], {
      //     type: response.headers["Content-Type"] as string,
      //   });

      const blob = response.data;

      // 3. Create a temporary URL pointing to that Blob object
      const url = window.URL.createObjectURL(blob);

      // 4. Create a temporary hidden anchor element
      const link = document.createElement("a");
      link.href = url;

      // 5. Specify the filename you want the user to save it as
      link.setAttribute("download", `${courseTitle} Certificate.pdf`);

      // 6. Append to document, trigger the click, and clean up
      document.body.appendChild(link);
      link.click();

      // Cleanup to free up browser memory
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col bg-white shadow-lg rounded-2xl">
      <Image
        width={300}
        height={300}
        src={`${preview}`}
        alt={`Certificate of attendance for ${courseTitle}`}
        className="w-full"
      />
      <div className="flex flex-col gap-2 p-4">
        <h3 className="font-bold">{courseTitle}</h3>
        <p className="font-semibold text-sm text-gray-400">
          Issue Date:{" "}
          <span className="text-base text-neutral-700">
            {new Date(issueDate).toLocaleDateString()}
          </span>
        </p>
        <button
          onClick={handleDownload}
          disabled={isDownloading || disabled}
          className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 shadow-sm"
        >
          {isDownloading ? (
            <>
              <LoaderCircle className="w-4 h-4" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download PDF Certificate
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CertificateCard;
