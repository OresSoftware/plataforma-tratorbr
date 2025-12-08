import React from 'react';
import Header from '../components/Header';
import Footer from '../components/footer';
import VoltarAoTopoBtn from '../components/VoltarAoTopoBtn';
import WhatsappFlutuante from '../components/WhatsappFlutuante';
import CalendlyFlutuante from "../components/CalendlyFlutuante";
import './style/TermosEPolitica.css';

const TermosEPolitica = () => {
  return (
    <div className="termos-uso-container">
      <Header />
      <main className="termos-uso-main">
        <h1 className="termos-uso-title">Termos de Uso e PolÍticas de Privacidade</h1>
        <div className="termos-uso-content">
          <p>Razão Social - MANFREDIN COMERCIO DE MAQUINAS AGRICOLAS LTDA, inscrita no CNPJ sob o nº CNPJ - 05.703.651/0001-61, com sede na cidade de Arapongas/PR, única e exclusiva proprietária do(s) domínio(s) www.tratorbr.com, doravante denominada com seu Nome Fantasia TRATORBR, estabelece o presente Termos de Uso e Politicas de Privacidade para os USUÁRIOS conforme as condições abaixo</p>

          <h2>1. Aceitação dos Termos</h2>
          <p>Ao acessar ou utilizar o site/aplicativo TratorBr, você — Pessoa Física (18+) ou Pessoa Jurídica (“Usuário”) — declara ter lido, entendido e aceito integralmente estes Termos e a Política de Privacidade (parte integrante deste instrumento).</p>

          <h2>2. Sobre a TratorBr (escopo do serviço)</h2>
          <p>A TratorBr é:
            (a) uma plataforma de intermediação tecnológica (“marketplace”) para divulgação, busca, gestão e negociação de máquinas, equipamentos e implementos agrícolas entre Usuários; e
            (b) uma fornecedora de soluções tecnológicas próprias comercializadas na plataforma, atualmente: TabelaBr, CheckBr, AnoBr e SimuladoBr (Seção 7).

            A TratorBr não é vendedora ou compradora dos itens anunciados entre Usuários, não garante qualidade/entrega/preço das transações entre terceiros e não presta aconselhamento financeiro, técnico ou jurídico.
          </p>

          <h2>3. Elegibilidade</h2>
          <p>Pessoa Física: somente maiores de 18 anos e capazes.

            Pessoa Jurídica: atos praticados por representante legal ou mandatário com poderes.
            A TratorBr pode solicitar documentos e recusar/suspender/encerrar contas por descumprimento destes Termos ou da lei.
          </p>

          <h2>4. Cadastro, Conta e Segurança</h2>
          <p>Alguns recursos exigem cadastro e login. O Usuário se compromete a manter dados verdadeiros e atualizados, guardar credenciais e responder por todas as atividades realizadas em sua conta. Suspeitas de uso indevido devem ser comunicadas imediatamente pelos canais oficiais.
          </p>

          <h2>5. Intermediação entre Usuários (marketplace) e limitações</h2>
          <p>Anúncios e conteúdos são de responsabilidade exclusiva de quem os publica. O estado, titularidade, regularidade documental e segurança dos bens são apurados diretamente entre as partes. A TratorBr não garante compatibilidade, desempenho, entrega, pagamento, ausência de vícios ou conformidade de bens/serviços ofertados por Usuários.
          </p>

          <h2>6. Conteúdo do Usuário e Moderação</h2>
          <p>Ao publicar informações, fotos, vídeos, documentos e descrições (“Conteúdo do Usuário”), você declara possuir direitos e autorizações e que o conteúdo é lícito e verídico. Você concede à TratorBr licença não exclusiva, gratuita, mundial e sublicenciável para armazenar, hospedar, exibir e distribuir o Conteúdo do Usuário para operar e promover a plataforma.<br />
            A TratorBr pode editar/ocultar/remover conteúdos e suspender/encerrar contas por violação destes Termos/lei, risco à plataforma, ordem de autoridade ou denúncias fundamentadas (Seção 16).
          </p>

          <h2>7. Soluções tecnológicas próprias da TratorBr</h2>
          <p>7.1. TabelaBr — Precificador de Máquina Agrícola<br />

            O que é: ferramenta de estimativa de preço com base em dados de mercado, históricos, características do bem, região e outros insumos.

            Como usar: o resultado é indicativo; não é garantia de venda/compra a determinado valor. Preços efetivos variam por estado de conservação, manutenção, documentação, oferta/demanda, sazonalidade etc.

            Limitações: a precisão depende da qualidade e atualidade das bases de dados. Você é responsável por validar informações antes de negociar.

            Proibido: engenharia reversa, scraping massivo, revenda de dados, uso para fins ilícitos.<br /><br />
            7.2. CheckBr — Avaliador e Checklist<br />

            O que é: checklists e orientações para vistoria e avaliação de máquinas agrícolas.

            Caráter informativo: não substitui laudos técnicos, perícias, inspeções oficiais, consulta a bases públicas/gravames ou avaliação presencial por profissional habilitado.

            Responsabilidade: o Usuário é responsável por verificar documentos, série/chassi, conformidades e realizar testes/inspeções adicionais.<br /><br />

            7.3. AnoBr — Verificador do Ano de Fabricação<br />

            O que é: ferramenta que estima/identifica o ano/modelo a partir de padrões, séries, marcações e dados de referência.

            Limitações: divergências podem ocorrer por alterações, remarcações, variações de fabricante ou registros incompletos. Use como apoio, sempre conferindo documentação oficial e junto ao fabricante/órgãos competentes.<br /><br />

            7.4. SimuladoBr — Simulador de Financiamento (DLL)<br />

            O que é: simulador de parcelas e condições com integração ao Banco DLL.

            Natureza da simulação: é meramente ilustrativa; não constitui proposta, aprovação de crédito ou garantia de taxa. As condições finais dependem de análise exclusiva do Banco DLL e podem mudar sem aviso.

            Dados e consentimento: para simular e, se desejar, prosseguir com intenção de crédito, você autoriza o compartilhamento dos dados estritamente necessários com o Banco DLL e parceiros envolvidos no processo.

            Disclaimer regulatório: a TratorBr não é instituição financeira nem correspondente bancário, salvo indicação expressa em fluxo específico; a decisão de crédito, prazos, taxas, seguros e outras condições são exclusivas do Banco DLL.
          </p>

          <h2>8. Planos, Assinaturas e Cobrança</h2>
          <p>A TratorBr pode oferecer planos/assinaturas, impulsionamentos e serviços avulsos (incluindo TabelaBr/CheckBr/AnoBr/SimuladoBr).
            Antes da contratação, serão informados preço, ciclo, benefícios, renovação, critérios de uso e formas de pagamento.
            Valores podem ser ajustados com aviso prévio na plataforma/e-mail.
            Arrependimento (CDC): quando aplicável e se o Usuário for consumidor (Pessoa Física), há 7 dias para desistência de compras online, contados do recebimento/contratação, observadas exceções legais (p.ex., serviço digital já iniciado/consumido). Reembolsos seguem regras exibidas no ato da compra.
          </p>

          <h2>9. Regras de Conduta (exemplos do que é proibido)</h2>
          <p>Violar leis/direitos/estes Termos; fraudes, omissão de vícios/gravames, lavagem de dinheiro; itens proibidos (armas, drogas, falsificados, bens roubados); violar PI/segredos/privacidade; spam, manipulação de ranking/avaliações; scraping sem autorização, sobrecarga, engenharia reversa; assédio, discriminação, discurso de ódio; conteúdo sexual explícito; burlar medidas técnicas.
          </p>

          <h2>10. Transações entre Usuários (compra, venda, entrega e pagamento)</h2>
          <p>As negociações ocorrem diretamente entre Usuários. A TratorBr não guarda valores nem intervém na entrega, salvo se ofertar solução específica de pagamento/logística via terceiro (termos próprios prevalecerão no que for conflitante).
            Boas práticas: vistoria, laudos, checagem de gravames/RENAVAM (se aplicável), conferência de série/chassi, teste operacional, contrato escrito, notas fiscais/recibos.
          </p>

          <h2>11. Propriedade Intelectual</h2>
          <p>“TratorBr”, marcas, logotipos, nome de domínio, layout, interfaces, conteúdos institucionais e software são de titularidade da TratorBr e/ou licenciadores. É vedado copiar, modificar, distribuir, criar obras derivadas ou explorar economicamente sem autorização.
          </p>

          <h2>12. Privacidade e LGPD</h2>
          <p>Tratamos dados pessoais conforme a Política de Privacidade e a LGPD (Lei 13.709/2018), para finalidades como autenticação, prevenção a fraudes, operação do serviço e, quando aplicável, integrações (ex.: Banco DLL no SimuladoBr).
            Direitos do titular: acesso, correção, exclusão, portabilidade, revogação do consentimento, entre outros, pelos canais indicados na plataforma.
            Detalhes sobre bases legais, compartilhamentos, retenção e cookies constam na Política de Privacidade.
          </p>

          <h2>13. Comunicações</h2>
          <p>Você autoriza comunicações por e-mail, notificações in-app, SMS/WhatsApp (quando consentido) para segurança, operação da conta, transações, serviços contratados e informações relevantes.
          </p>


          <h2>14. Disponibilidade, Suporte e Manutenção</h2>
          <p>A plataforma é fornecida “no estado em que se encontra”. Poderão ocorrer manutenções/atualizações com ou sem aviso prévio, buscando minimizar impactos. Salvo acordo específico, não há SLA de disponibilidade. Suporte pelos canais oficiais.
          </p>

          <h2>15. Garantias e Limitações de Responsabilidade</h2>
          <p>A TratorBr não garante disponibilidade ininterrupta, ausência de erros, adequação a finalidade específica ou precisão absoluta de estimativas (TabelaBr, AnoBr).
            Na máxima extensão legal, a TratorBr não responde por danos indiretos, lucros cessantes, perda de dados, perda de chance, atos/omissões de Usuários/terceiros, falhas de rede, caso fortuito/força maior.
            Limite global para danos diretos: o maior entre R$ 1.000,00 e o montante efetivamente pago pelo Usuário à TratorBr, referente ao serviço diretamente relacionado ao evento, nos últimos 12 meses (não aplicável a hipóteses em que a lei vede limitação, nem a dolo).
          </p>

          <h2>16. Denúncias, Notificações e Takedown</h2>
          <p>Recebida denúncia fundamentada ou ordem legal, a TratorBr poderá remover conteúdo, suspender funcionalidades e cooperar com autoridades. Titulares de direitos podem solicitar remoção via canal apropriado (informar URL, prova de titularidade e fundamentação).
          </p>

          <h2>17. Suspensão e Encerramento</h2>
          <p>A TratorBr pode suspender/encerrar contas, anúncios e acessos por violação destes Termos/lei, risco à plataforma, inadimplência de planos, ordem legal ou por medidas de segurança. O Usuário pode solicitar encerramento; alguns dados poderão ser mantidos para cumprimento legal.
          </p>

          <h2>18. Cessão</h2>
          <p>O Usuário não poderá ceder direitos/obrigações sem consentimento. A TratorBr pode ceder estes Termos e seus créditos/obrigações em operações societárias, fusões, aquisições ou reorganizações.
          </p>

          <h2>19. Alterações destes Termos</h2>
          <p>A TratorBr poderá alterar estes Termos a qualquer tempo. Mudanças relevantes serão comunicadas via plataforma/e-mail com antecedência razoável. O uso após a vigência implica aceite.

          </p>

          <h2>20. Lei Aplicável e Foro</h2>
          <p>Aplica-se a lei brasileira. Fica eleito o Foro da Comarca de Arapongas/PR, com renúncia a qualquer outro, por mais privilegiado que seja.
          </p>

          <h2>21. Disposições Finais</h2>
          <p>A nulidade parcial de cláusula não afeta as demais; tolerância não implica renúncia; estes Termos constituem o acordo integral entre TratorBr e o Usuário sobre o uso da plataforma e das soluções TabelaBr, CheckBr, AnoBr e SimuladoBr.
          </p>

          <p className='att'>Última atualização: 08/09/2025</p>

        </div>
      </main>
      {/* <WhatsappFlutuante /> */}
      {/* <CalendlyFlutuante /> */}
      <VoltarAoTopoBtn />
      <Footer />
    </div>
  );
};

export default TermosEPolitica;

