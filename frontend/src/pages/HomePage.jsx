import React from 'react';
import Header from '../components/Header';
import Footer from '../components/footer';
import VoltarAoTopoBtn from '../components/VoltarAoTopoBtn';
// import WhatsappFlutuante from '../components/WhatsappFlutuante';
// import CalendlyLink from "../components/CalendlyLink";
import './style/HomePage.css';


export default function HomePage() {


  return (

    <main className="contato-wrapper">
      <Header />


      {/* <WhatsappFlutuante /> */}
      {/* <CalendlyFlutuante />  */}
      <VoltarAoTopoBtn />
      <Footer />
    </main>
  );
}
