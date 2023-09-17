"use client";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import { FileVideo, Upload } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";

type Status = "waiting" | "converting" | "uploading" | "generating" | "sucess";

const statusMessage = {
  waiting: "Carregando...",
  converting: "Convertendo...",
  uploading: "Enviando...",
  generating: "Gerando...",
  sucess: "Sucesso...",
};

export default function VideoInputForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("waiting");
  const promptInputRef = React.useRef<HTMLTextAreaElement>(null);
  const ffmpegRef = useRef<FFmpeg>(new FFmpeg());
  const [isLoading, setIsLoading] = useState(false);

  const convertVideoToAudio = async (video: File) => {
    console.log("Converted started");

    ffmpegRef.current.writeFile("input.mp4", await fetchFile(video));

    ffmpegRef.current.on("progress", (progress) => {
      console.log(`Convert progress : ${Math.round(progress.progress * 100)}%`);
    });

    await ffmpegRef.current.exec([
      "-i",
      "input.mp4",
      "-map",
      "0:a",
      "-b:a",
      "20k",
      "-acodec",
      "libmp3lame",
      "output.mp3",
    ]);

    const data = await ffmpegRef.current.readFile("output.mp3");

    const audioFileBlob = new Blob([data], { type: "audio/mp3" });

    const audiotFile = new File([audioFileBlob], "audio.mp3", {
      type: "audio/mpeg",
    });

    console.log("Conversion finished");

    return audiotFile;
  };

  const handleUploadVideo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const promp = promptInputRef?.current?.value;

    if (!promp) {
      return;
    }

    setStatus("converting");

    const audioFile = await convertVideoToAudio(videoFile!);

    const data = new FormData();

    data.append("file", audioFile);

    setStatus("uploading");

    const response = await fetch("/videos", {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: data,
    });

    const video = await response.json();

    const videoId = video.id;

    setStatus("generating");

    await fetch(`http://localhost:3333/videos/${videoId}/transcription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transcription: promp,
      }),
    });

    setStatus("sucess");
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;

    if (!files) {
      return;
    }

    const selectedFile = files[0];

    setVideoFile(selectedFile);
  };

  const previewURL = useMemo(() => {
    if (!videoFile) {
      return null;
    }

    return URL.createObjectURL(videoFile);
  }, [videoFile]);

  useEffect(() => {
    setIsLoading(true);

    const load = async () => {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd";
      const ffmpeg = ffmpegRef.current;

      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      });

      setIsLoading(false);
    };

    load();
  }, []);

  return (
    <form onSubmit={handleUploadVideo} className="space-y-6">
      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <label
          htmlFor="video"
          className="relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5"
        >
          {videoFile ? (
            <video
              src={previewURL!}
              controls={false}
              className="pointer-events-none absolute inset-0"
            />
          ) : (
            <>
              <FileVideo className="w-4 h-4" />
              Selecione um vídeo
            </>
          )}
        </label>
      )}

      <input
        type="file"
        id="video"
        accept="video/mp4"
        onChange={handleFileSelected}
        className="sr-only"
      />

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="transcription_prompt">Prompt de transcrição</Label>

        <Textarea
          id="transcription_prompt"
          className="h-20 resize-none leading-relaxed"
          placeholder="Inclua palavras-chave mencionadas no vídeo separadas por vírgula (,)"
          ref={promptInputRef}
          disabled={status !== "waiting"}
        />
      </div>

      <Button
        data-sucess={status === "sucess"}
        disabled={status !== "waiting"}
        type="submit"
        className="w-full data-[sucess=true]:bg-emerald-400"
      >
        {status === "waiting" ? (
          <>
            Carregar vídeo
            <Upload className="w-4 h-4 ml-2" />
          </>
        ) : (
          statusMessage[status]
        )}
      </Button>
    </form>
  );
}
