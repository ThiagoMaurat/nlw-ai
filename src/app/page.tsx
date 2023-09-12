import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Github } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col ">
      <div className="px-6 py-3 flex items-center justify-between border-b">
        <h1 className="text-xl font-bold">upload.ai</h1>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Desenvolvido com 💕 e Typescript
          </span>

          <Separator orientation="vertical" className="h-6" />

          <Button variant={"outline"}>
            <Github className="w-4 h-4 mr-2" />
            Github
          </Button>
        </div>
      </div>

      <main className="flex-1 p-6 flex gap-6 ">
        <div className="flex flex-col flex-1 gap-4">
          <div className="grid grid-rows-2 gap-4 flex-1"></div>
          <p className="text-sm text-muted-foreground">
            Lembre-se: você pode utilizar a variável <code className="text-violet-400">{'{transcription}'}</code> no seu promp
            para adicionar o conteúdo da transcriação do vídeo selecionado.
          </p>
        </div>
        <aside className="w-96"></aside>
      </main>
    </div>
  );
}
