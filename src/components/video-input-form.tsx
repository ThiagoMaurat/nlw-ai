"use client";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { FileVideo, Upload } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";

export default function VideoInputForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const promptInputRef = React.useRef<HTMLTextAreaElement>(null);
  const ffmpegRef = useRef(new FFmpeg());
  const [isLoading, setIsLoading] = useState(false);

  const handleUploadVideo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const promp = promptInputRef?.current?.value;

    if (!promp) {
      return;
    }
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
        />
      </div>

      <Button type="submit" className="w-full">
        Carregar vídeo
        <Upload className="w-4 h-4 ml-2" />
      </Button>
    </form>
  );
}
