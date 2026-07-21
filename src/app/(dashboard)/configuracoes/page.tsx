import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { PerfilForm } from "./_components/perfil";
import { TipoUso } from "./_components/tipo-uso";
import { Aparencia } from "./_components/aparencia";
import { Categorias } from "./_components/categorias";
import { Subcategorias } from "./_components/subcategorias";
import { TagsManager } from "./_components/tags";
import { Bancos } from "./_components/bancos";
import { MetodosPagamento } from "./_components/metodos-pagamento";
import { Notificacoes } from "./_components/notificacoes";

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie perfil, categorias, bancos e preferências do sistema.
        </p>
      </div>

      <Tabs defaultValue="perfil" orientation="horizontal">
        <TabsList variant="line" className="w-full flex-wrap">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="tipo-uso">Tipo de Uso</TabsTrigger>
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="subcategorias">Subcategorias</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="bancos">Bancos</TabsTrigger>
          <TabsTrigger value="metodos-pagamento">Métodos de Pagamento</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="perfil">
            <PerfilForm />
          </TabsContent>
          <TabsContent value="tipo-uso">
            <TipoUso />
          </TabsContent>
          <TabsContent value="aparencia">
            <Aparencia />
          </TabsContent>
          <TabsContent value="categorias">
            <Categorias />
          </TabsContent>
          <TabsContent value="subcategorias">
            <Subcategorias />
          </TabsContent>
          <TabsContent value="tags">
            <TagsManager />
          </TabsContent>
          <TabsContent value="bancos">
            <Bancos />
          </TabsContent>
          <TabsContent value="metodos-pagamento">
            <MetodosPagamento />
          </TabsContent>
          <TabsContent value="notificacoes">
            <Notificacoes />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
