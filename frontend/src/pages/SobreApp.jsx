import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/footer';
import WhatsappFlutuante from '../components/WhatsappFlutuante';
import VoltarAoTopoBtn from '../components/VoltarAoTopoBtn';
import CalendlyFlutuante from "../components/CalendlyFlutuante";
import CalendlyLink from "../components/CalendlyLink";
import { Link } from 'react-router-dom';
import './style/AjudaPage.css';
import './style/SobreApp.css';


const SearchIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const PerfilIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const SuporteIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 18V16C3 11.0294 7.02944 7 12 7C16.9706 7 21 11.0294 21 16V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 19C21 20.1046 20.1046 21 19 21H18C16.8954 21 16 20.1046 16 19V16C16 14.8954 16.8954 14 18 14H21V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 19C3 20.1046 3.89543 21 5 21H6C7.10457 21 8 20.1046 8 19V16C8 14.8954 7.10457 14 6 14H3V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const HomeIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const MoneyIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5C18 16.4283 17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const LaudoIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 15L11 17L15 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const DisruptivoIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const AvaliacaoIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4H18C19.1046 4 20 4.89543 20 6V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V6C4 4.89543 4.89543 4 6 4H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 14L11 16L15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const AlgoritmoIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.59 13.51L15.42 17.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CadastroIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 21V19C16 16.7909 14.2091 15 12 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 8V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M23 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const FuncionalidadesIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const FaqIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 11.5C21.0039 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87273 19.6955 8.7 19.1L3 21L4.9 15.3C4.30453 14.1273 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.9969 12.5 3H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 13.5C12 13.5 13.5 13.5 13.5 11.5C13.5 9.5 10.5 11.5 10.5 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const SuporteeIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 18V16C3 11.0294 7.02944 7 12 7C16.9706 7 21 11.0294 21 16V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 19C21 20.1046 20.1046 21 19 21H18C16.8954 21 16 20.1046 16 19V16C16 14.8954 16.8954 14 18 14H21V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 19C3 20.1046 3.89543 21 5 21H6C7.10457 21 8 20.1046 8 19V16C8 14.8954 7.10457 14 6 14H3V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const AgendamentoIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const AjudaPage = () => {
    const [faqAberto, setFaqAberto] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [activeImageSlide, setActiveImageSlide] = useState(0);

    const toggleFaq = (index) => {
        setFaqAberto(faqAberto === index ? null : index);
    };

    const faqData = [
        {
            pergunta: "Como funciona a plataforma TratorBR?",
            introducao: "Oferecemos um sistema focado na avaliação e precificação de máquinas agrícolas usadas. Nosso sistema calcula...",
            resposta: "Oferecemos um sistema focado na avaliação e precificação de máquinas agrícolas usadas. Nosso sistema calcula o valor estimado de um equipamento com base em parâmetros como marca, modelo, ano, nota técnica e valor do veículo novo. A plataforma conta com dezenas de usuários verificados, um banco de dados completo de máquinas e ferramentas que facilitam as suas transações no agronegócio, garantindo a melhor compra e venda da sua máquina agrícola."
        },
        {
            pergunta: "O que o Aplicativo vai mudar na minha realidade?",
            introducao: "Nosso aplicativo revoluciona o mercado ao eliminar a incerteza e garantir que todas as suas decisões de compra, venda e troca sejam fundamentadas...",
            resposta: "Nosso aplicativo revoluciona o mercado ao eliminar a incerteza e garantir que todas as suas decisões de compra, venda e troca sejam fundamentadas no maior e mais completo banco de dados de máquinas agrícolas do Brasil. Sua empresa ganha rentabilidade e segurança máxima ao substituir avaliações subjetivas por um sistema padronizado, tornando o processo mais rápido e profissional. Além disso, o App garante total autonomia e eficiência operacional à sua equipe, funcionando de forma offline mesmo em áreas rurais, com sincronização automática dos dados quando a conectividade é restabelecida."
        },
        {
            pergunta: "Como fazer um agendamento de demonstração?",
            introducao: "O agendamento funciona diretamente pela nossa plataforma. Acesse a pagina de contato ou utilize o botão verde localizado...",
            resposta: "O agendamento funciona diretamente pela nossa plataforma. Acesse a pagina de contato ou utilize o botão verde localizado na parte inferior direita e faça o seu agendamento com a TratorBR, escolhendo o melhor horário possível para você. Assim, você conhecerá como pode melhorar a sua tomada de decisão em compra, venda e troca com total segurança e precisão."
        },
        {
            pergunta: "Como faço para cadastrar minha empresa no sistema da TratorBR?",
            introducao: "O cadastro é geralmente feito por meio de contato direto com a nossa equipe comercial. É necessário solicitar uma demonstração...",
            resposta: "O cadastro é geralmente feito por meio de contato direto com a nossa equipe comercial. É necessário solicitar uma demonstração e negociar um plano de assinatura para ter acesso às funcionalidades completas. Entre em contato conosco."
        },
        {
            pergunta: "O aplicativo está disponível para download?",
            introducao: "Sim! Nosso aplicativo móvel está disponível para download gratuito tanto na App Store (iOS) quanto na Google Play Store (Android). Com o App TratorBR...",
            resposta: "Sim! Nosso aplicativo móvel está disponível para download gratuito tanto na App Store (iOS) quanto na Google Play Store (Android). Com o App TratorBR, você tem acesso completo a todas as funcionalidades da plataforma diretamente do seu celular ou tablet."
        },
        {
            pergunta: "Meus dados e informações de avaliações estão seguros?",
            introducao: "Sim, a segurança e a confidencialidade dos dados são nossa prioridade, seguindo as leis da LGPD. Utilizamos criptografia...",
            resposta: "Sim, a segurança e a confidencialidade dos dados são nossa prioridade, seguindo as leis da LGPD. Utilizamos criptografia e protocolos de segurança avançados para proteger as informações de todas as avaliações e a identidade de nossos clientes."
        },
        {
            pergunta: "Como funciona o sistema de avaliação?",
            introducao: "Nosso sistema de avaliação utiliza tecnologia de ponta combinada com expertise humana para determinar o valor justo de máquinas agrícolas...",
            resposta: "Nosso sistema de avaliação utiliza tecnologia de ponta combinada com expertise humana para determinar o valor justo de máquinas agrícolas. Consideramos diversos fatores como marca, modelo, ano de fabricação, horas de uso, estado de conservação, histórico de manutenção, modificações realizadas e as condições atuais do mercado. Nossa base de dados contém informações de milhares de transações realizadas, permitindo análises comparativas precisas. Além disso, nossa equipe de especialistas em máquinas agrícolas realiza verificações técnicas quando necessário, garantindo avaliações confiáveis e atualizadas com as tendências do mercado."
        },
        {
            pergunta: "Como entrar em contato com o suporte?",
            introducao: "Nosso atendimento ao cliente está disponível através de múltiplos canais para sua conveniência. Você pode nos contatar via WhatsApp para respostas rápidas...",
            resposta: "Nosso atendimento ao cliente está disponível através de múltiplos canais para sua conveniência. Você pode nos contatar via WhatsApp para respostas rápidas, enviar e-mail para contato@tratorbr.com.br para questões mais detalhadas, ou através da nossa pagina de contato no próprio site. Nossa equipe é composta por especialistas em máquinas agrícolas e profissionais experientes no agronegócio, prontos para ajudar com qualquer dúvida sobre compra, venda, avaliação ou uso da plataforma. Oferecemos todo o suporte necessário durante a sua jornada na TratorBR."
        }
    ];

    const tabsData = [
        {
            id: 'home',
            label: 'Home',
            title: 'Conheça mais da Home',
            description: 'Eaê! Bem-vindo à sua central de comando. A tela de Home do TratorBR não é apenas um início, é o seu painel de controle para tomar decisões mais rápidas e inteligentes no mercado de máquinas agrícolas. Pense nela como a cabine da sua máquina mais potente: tudo o que você precisa está ao alcance de um toque.',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            recursosCards: [
                {
                    idHtml: 'recurso-card-1',
                    icone: <PerfilIcon />,
                    titulo: 'Perfil',
                    texto: 'Acesso rápido às suas informações e configurações pessoais.',
                    iconColor: null,
                    textColor: null
                },
                {
                    idHtml: 'recurso-card-7',
                    icone: <SuporteIcon />,
                    titulo: 'Suporte',
                    texto: 'Facilitado ao seu acesso, para tirar todas as suas dúvidas.',
                    iconColor: '#fff',
                    textColor: '#fff'
                },
                {
                    idHtml: 'recurso-card-3',
                    icone: <HomeIcon />,
                    titulo: 'Inicialização',
                    texto: 'Rápido acesso às avaliações e principais funcionalidades.',
                    iconColor: '#15383E',
                    textColor: undefined
                }
            ],
            appImages: [
                '/imagens-tutorial/IMG-HOME.png',
                '/imagens-tutorial/IMG-HOME-2.png',
                '/imagens-tutorial/IMG-HOME-3.png',
                '/imagens-tutorial/IMG-HOME-4.png',
                '/imagens-tutorial/IMG-HOME-5.png',
                '/imagens-tutorial/IMG-HOME-6.png'
            ]
        },
        // {
        //   id: 'AnoBR',
        //   label: 'AnoBr',
        //   title: 'Como anunciar sua máquina',
        //   description: 'No mercado de máquinas, o ano de fabricação é muito mais do que um número. É um fator decisivo de valorização ou desvalorização. O AnoBR é a sua ferramenta para decifrar esse fator com precisão cirúrgica, e baseado em dados dos fabricantes. Chega de "achismo". Use dados concretos para justificar o valor de um equipamento mais novo ou para negociar o preço de um mais antigo.',
        //   videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        //   appImages: [
        //     '/imagens-tutorial/anuncio-1.png',
        //     '/imagens-tutorial/anuncio-2.png',
        //     '/imagens-tutorial/anuncio-3.png'
        //   ]
        // },
        {
            id: 'tabelabr',
            label: 'TabelaBr',
            title: 'Como avaliar minha maquina',
            description: 'Você já imaginou ter uma Tabela FIPE, mas construída para a realidade e a dinâmica do mercado de máquinas agrícolas? Essa ferramenta existe e se chama TabelaBR. Nós somos a referência de preços de Equipamento do Agronegócio. Com base em um algoritmo feito para calcular o valor de uma Máquina baseado no Estado de Conservação do Equipamento, a TabelaBr é a inteligência de dados trabalhando para o seu negócio.',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            recursosCards: [
                {
                    idHtml: 'recurso-card-1',
                    icone: <MoneyIcon />,
                    titulo: 'Presificação',
                    texto: 'Descubra o verdadeiro valor de mercado do seu equipamento.',
                    iconColor: null,
                    textColor: null
                },
                {
                    idHtml: 'recurso-card-7',
                    icone: <SearchIcon />,
                    titulo: 'Busca de suas avaliações',
                    texto: 'Acesse todas as suas avaliações anteriores em um só lugar.',
                    iconColor: '#fff',
                    textColor: '#fff'
                },
                {
                    idHtml: 'recurso-card-3',
                    icone: <DisruptivoIcon />,
                    titulo: 'Desrupitivo',
                    texto: 'Transformação no mercado de máquinas agrícolas usadas.',
                    iconColor: '#15383E',
                    textColor: undefined
                }
            ],
            appImages: [
                '/imagens-tutorial/tabelabr-00.png',
                '/imagens-tutorial/tabelabr-01.png',
                '/imagens-tutorial/tabelabr-02.png',
                '/imagens-tutorial/tabelabr-03.png',
                '/imagens-tutorial/tabelabr-04.png',
                '/imagens-tutorial/tabelabr-05.png',
                '/imagens-tutorial/tabelabr-06.png',
                '/imagens-tutorial/tabelabr-07.png',
                '/imagens-tutorial/tabelabr-08.png',
                '/imagens-tutorial/tabelabr-09.png',
                '/imagens-tutorial/tabelabr-10.png',
                '/imagens-tutorial/tabelabr-11.png',
                '/imagens-tutorial/tabelabr-12.png',
                '/imagens-tutorial/tabelabr-13.png',
                '/imagens-tutorial/tabelabr-14.png',
            ]
        },
        {
            id: 'checklist',
            label: 'ChecklistBr',
            title: 'Descobrindo a nota do meu equipamento',
            description: 'Se AnoBR e TabelaBR te dão a base, o CheckBR é o seu bisturi de precisão. É aqui que separamos uma máquina comum de uma máquina excepcional. Esta ferramenta aponta oestado de Conservação exato, do seu equipamento, resultando em um Laudo, para documentar o que realmente esse Equipamento significa.',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            recursosCards: [
                {
                    idHtml: 'recurso-card-1',
                    icone: <AvaliacaoIcon />,
                    titulo: 'Avaliação Completa',
                    texto: 'Avaliação detalhada do estado de conservação do equipamento.',
                    iconColor: null,
                    textColor: null
                },
                {
                    idHtml: 'recurso-card-7',
                    icone: <AlgoritmoIcon />,
                    titulo: 'Algoritimos Avançados',
                    texto: 'Uma série de cálculos para o resultado mais preciso possível.',
                    iconColor: '#fff',
                    textColor: '#fff'
                },
                {
                    idHtml: 'recurso-card-3',
                    icone: <LaudoIcon />,
                    titulo: 'Gerador de Laudo',
                    texto: 'Após a avaliação, gere um laudo completo e documentado do estado do equipamento.',
                    iconColor: '#15383E',
                    textColor: undefined
                }
            ],
            appImages: [
                '/imagens-tutorial/checklist-1.png',
                '/imagens-tutorial/checklist-2.png',
                '/imagens-tutorial/checklist-3.png',
                '/imagens-tutorial/checklist-4.png',
                '/imagens-tutorial/checklist-5.png',
                '/imagens-tutorial/checklist-6.png',
                '/imagens-tutorial/checklist-7.png',
                '/imagens-tutorial/checklist-8.png',
                '/imagens-tutorial/checklist-9.png',
                '/imagens-tutorial/checklist-10.png',
                '/imagens-tutorial/checklist-11.png',
                '/imagens-tutorial/checklist-12.png',
                '/imagens-tutorial/checklist-13.png',
                '/imagens-tutorial/checklist-14.png',
                '/imagens-tutorial/checklist-15.png',
                '/imagens-tutorial/checklist-16.png',
                '/imagens-tutorial/checklist-17.png',
                '/imagens-tutorial/checklist-18.png'
            ]
        }
    ];

    const cardsData = [
        {
            numero: '1',
            titulo: 'Cadastrar no APP',
            descricao: 'Preencha seus dados para desbloquear a inteligência do mercado agro. É rápido, fácil e o primeiro passo para você ter o poder da avaliação assertiva exclusivo em suas mãos.'
        },
        {
            numero: '2',
            titulo: 'Validar o email',
            descricao: 'Valide seu acesso seguro! Na sua caixa de entrada! Enviamos um link de confirmação para garantir a total segurança da sua conta e dos seus dados. Lembre-se de checar o spam. Um clique e você estará pronto para o próximo nível.'
        },
        {
            numero: '3',
            titulo: 'Entrar no APP',
            descricao: 'Domine o Mercado. Entre! Acesso liberado. Entre agora no TratorBR e comece a transformar o jeito como você negocia. Não se esqueça, ao entrar pela 1ª vez realize o Passo a Passo segundo o tutorial, e aproveite do melhor que a TratorBr pode te oferecer.'
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveImageSlide((prev) =>
                prev === tabsData[activeTab].appImages.length - 1 ? 0 : prev + 1
            );
        }, 4000);

        return () => clearInterval(interval);
    }, [activeTab, tabsData]);

    const handlePrevSlide = () => {
        setActiveImageSlide((prev) =>
            prev === 0 ? tabsData[activeTab].appImages.length - 1 : prev - 1
        );
    };

    const handleNextSlide = () => {
        setActiveImageSlide((prev) =>
            prev === tabsData[activeTab].appImages.length - 1 ? 0 : prev + 1
        );
    };

    const goToSlide = (index) => {
        setActiveImageSlide(index);
    };

    return (
        <div className="ajuda-page">
            <Header />

            {/* VIDEO DE CADASTRO */}
            <section className="texto-video-section">
                <div className="texto-video-container">
                    <div className="texto-video-content">
                        <div className="texto-video-text">
                            <h2>Vamos lá! <br></br>Comece por aqui.</h2>
                            <p>
                                Aqui está o passo a passo de como usar o nosso aplicativo, para você extrair o melhor do nosso sistema. Aproveite tudo que nossa plataforma oferece!
                            </p>
                        </div>

                        <div className="recursos-grid-novo">

                            <Link to="#cadastro-passos">
                                <div className="recurso-card-novo">
                                    <div className="recurso-icon-novo">
                                        <CadastroIcon />
                                    </div>
                                    <p className="recurso-titulo-novo">Como se <strong>cadastrar</strong> no aplicativo?</p>
                                </div>
                            </Link>

                            <Link to="#proximos-passos">
                                <div className="recurso-card-novo">
                                    <div className="recurso-icon-novo">
                                        <FuncionalidadesIcon />
                                    </div>
                                    <p className="recurso-titulo-novo">Como utilizar <strong>cada área</strong> do aplicativo?</p>
                                </div>
                            </Link>

                            <a href="#demonstracao" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="recurso-card-novo">
                                    <div className="recurso-icon-novo">
                                        <AgendamentoIcon />
                                    </div>
                                    <p className="recurso-titulo-novo">O que seria agendar uma<strong> demonstração</strong>?</p>
                                </div>
                            </a>

                            <Link to="/contato#contato-c">
                                <div className="recurso-card-novo">
                                    <div className="recurso-icon-novo">
                                        <SuporteeIcon />
                                    </div>
                                    <p className="recurso-titulo-novo">Como falar com o <strong>suporte</strong> da TratorBr?</p>
                                </div>
                            </Link>

                        </div>
                    </div>
                </div>
            </section>

            {/* 1-2-3 CADASTRO */}
            <section id="cadastro-passos" className="cards-numerados-section">
                <div className="cards-numerados-container">
                    <div className="cards-grid">
                        {cardsData.map((card, index) => (
                            <div key={index} className="card-numerado">
                                <div className="card-numero">
                                    {card.numero}
                                </div>
                                <h3 className="card-titulo">{card.titulo}</h3>
                                <p className="card-descricao">{card.descricao}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* EXPLICAÇÕES EM ABAS */}
            <section id="proximos-passos" className="tabs-video-section">
                <div className="tabs-video-container">
                    <div className="tabs-header">
                        <h2>Primeiros Passos</h2>
                        <div className='divisoria'></div>
                    </div>

                    <div className="tabs-nav">
                        {tabsData.map((tab, index) => (
                            <button
                                key={tab.id}
                                className={`tab-button ${activeTab === index ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveTab(index);
                                    setActiveImageSlide(0);
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="tabs-content-wrapper">
                        <div className="tabs-content-new">
                            <div className="tabs-left-column">
                                <h3 className="tabs-text-title">{tabsData[activeTab].title}</h3>
                                <p className="tabs-text-description">{tabsData[activeTab].description}</p>
                                <div className='recursos-ajuda'>
                                    {tabsData[activeTab].recursosCards && tabsData[activeTab].recursosCards.map((card, index) => (
                                        <div
                                            key={index}
                                            className="recurso-card-figma"
                                            id={card.idHtml}
                                        >
                                            <div
                                                className="recurso-icon-figma"
                                                style={{ color: card.iconColor || 'inherit' }}
                                            >
                                                {card.icone}
                                            </div>
                                            <h3 className="recurso-titulo-figma" style={{ color: card.textColor || 'inherit' }}>
                                                {card.titulo}
                                            </h3>
                                            <p
                                                className="recurso-texto-figma"
                                                style={{ color: card.textColor || 'inherit' }}
                                            >
                                                {card.texto}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="tabs-right-column">
                                <div className="carousel-container">
                                    <div className="carousel-text">Arraste para o lado →</div>

                                    <div className="carousel-images">
                                        {tabsData[activeTab].appImages.map((image, index) => (
                                            <div key={index} className={`carousel-image-wrapper ${index === activeImageSlide ? 'active' : ''}`}
                                            >
                                                <img src={image} alt={`App Screen ${index + 1}`} className="carousel-image" />
                                            </div>
                                        ))}

                                        <button className="carousel-arrow carousel-arrow-left" onClick={handlePrevSlide} aria-label="Imagem anterior">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M15 19l-7-7 7-7"></path>
                                            </svg>
                                        </button>
                                        <button className="carousel-arrow carousel-arrow-right" onClick={handleNextSlide} aria-label="Próxima imagem">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 19l7-7-7-7"></path>
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="carousel-dots">
                                        {tabsData[activeTab].appImages.map((_, index) => (
                                            <button key={index} className={`carousel-dot ${index === activeImageSlide ? 'active' : ''}`} onClick={() => goToSlide(index)} aria-label={`Ir para slide ${index + 1}`}>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="diferenciais-section" id='demonstracao'>
                <div className="container-sobre">
                    <div className="content-grid-reverse">
                        <div className="text-content">
                            <h2 className="section-title">O que é uma demonstração</h2>
                            <p className="section-description">
                                Uma demonstração é uma apresentação prática focada em mostrar como a tecnologia da TratorBR resolve os desafios reais do seu negócio. Mais do que um tour pelas funcionalidades, é o momento de visualizar como nossa base de dados e algoritmos transformam a avaliação de máquinas usadas em decisões seguras e lucrativas, integrando agilidade e precisão técnica ao seu fluxo de trabalho.
                            </p>
                            <p className="section-description">
                                Durante essa reunião, nossa equipe guia você por cenários reais de mercado, demonstrando como a plataforma gera laudos detalhados e sugestões de precificação baseadas em dados atualizados. O objetivo principal é garantir que você tenha total clareza sobre o retorno sobre o investimento, permitindo que você tire dúvidas específicas e entenda como podemos impulsionar sua estratégia comercial com transparência e inovação tecnológica.
                            </p>
                        </div>
                        <div className="visual-content-diferenciais">
                            <div className="feature-list">
                                <div className="feature-item">
                                    <div className="feature-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="11" cy="11" r="8"></circle>
                                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                            <line x1="11" y1="8" x2="11" y2="14"></line>
                                            <line x1="8" y1="11" x2="14" y2="11"></line>
                                        </svg>
                                    </div>
                                    <div className="feature-text">
                                        <h4>Diagnóstico Real</h4>
                                        <p>Análise de Gargalos Identificamos as falhas atuais no seu processo de avaliação e mostramos como eliminá-las.</p>
                                    </div>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                            <line x1="8" y1="21" x2="16" y2="21"></line>
                                            <line x1="12" y1="17" x2="12" y2="21"></line>
                                            <polygon points="10 8 14 10 10 12 10 8"></polygon>
                                        </svg>
                                    </div>
                                    <div className="feature-text">
                                        <h4>Simulação Prática</h4>
                                        <p>Dados do Seu Negócio Visualização real da plataforma operando com os modelos de máquinas que você mais negocia.</p>
                                    </div>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="12" y1="1" x2="12" y2="23"></line>
                                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                        </svg>
                                    </div>
                                    <div className="feature-text">
                                        <h4>ROI Projetado</h4>
                                        <p>Cálculo de Retorno Projeção clara de quanto tempo e dinheiro sua operação economiza ao automatizar os laudos.</p>
                                    </div>
                                </div>
                                <div className="feature-item">
                                    <div className="feature-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    </div>
                                    <div className="feature-text">
                                        <h4>Customização Total</h4>
                                        <p>Ajuste ao seu Fluxo Definição de como as ferramentas de precificação se encaixam na rotina específica da sua equipe.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="cta-section-agendamento">
                <div className="container-sobre">
                    <div className="cta-content">
                        <h2 className="cta-title-agendamento">Pronto para revolucionar sua gestão rural?</h2>
                        <p className="cta-description">
                            Junte-se a centenas de produtores que já transformaram
                            sua gestão com a TratorBR.
                        </p>

                        <button className='agendamento-button'>
                            <CalendlyLink />
                        </button>
                    </div>
                </div>
            </section>
            <CalendlyFlutuante />
            <VoltarAoTopoBtn />
            <Footer />
        </div>
    );
};

export default AjudaPage;
