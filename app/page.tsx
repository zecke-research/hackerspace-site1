import Image from "next/image";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Ir al contenido
      </a>
      <header className="site-header">
        <a
          className="wordmark"
          href="#inicio"
          aria-label="Nodo Serrano, inicio"
        >
          NODO<span>SERRANO</span>
        </a>
        <nav aria-label="Navegación principal">
          <a href="#espacio">El espacio</a>
          <a href="#comunidad">Comunidad</a>
          <a href="#contacto">Contacto</a>
        </nav>
        <span className="location">Tandil, Argentina</span>
      </header>

      <main id="contenido">
        <section id="inicio" className="hero" aria-labelledby="titulo">
          <div className="hero-copy">
            <p className="eyebrow">
              <span aria-hidden="true" /> HackerSpace
            </p>
            <h1 id="titulo">HackerSpace Nodo Serrano</h1>
            <p className="hero-description">
              Un espacio para aprender haciendo. Tecnología, herramientas y
              conocimiento compartido desde Tandil.
            </p>
            <a className="button" href="#espacio">
              Conocer el espacio <span aria-hidden="true">↗</span>
            </a>
            <p className="hero-footnote">
              Investigación y educación con foco en Ethereum.
            </p>
          </div>
          <figure className="hero-photo">
            <Image
              src="/hackerspace.webp"
              alt="Encuentro de la comunidad en el espacio de Nodo Serrano, con una mesa de trabajo y computadoras."
              width={960}
              height={1280}
              preload
              sizes="(max-width: 760px) 100vw, 46vw"
            />
            <figcaption>Un lugar para encontrarnos y construir.</figcaption>
          </figure>
        </section>

        <section
          id="espacio"
          className="space-section"
          aria-labelledby="espacio-titulo"
        >
          <p className="section-index">01 / EL ESPACIO</p>
          <div className="section-heading">
            <h2 id="espacio-titulo">
              Compartir lo que sabemos.
              <br />
              Explorar lo que falta.
            </h2>
            <p>
              El HackerSpace forma parte de Nodo Serrano: una comunidad de
              investigación y educación que conecta a Tandil con el ecosistema
              Ethereum y la tecnología abierta.
            </p>
          </div>
        </section>

        <section
          id="comunidad"
          className="community-section"
          aria-labelledby="comunidad-titulo"
        >
          <div className="community-intro">
            <p className="section-index">02 / COMUNIDAD</p>
            <h2 id="comunidad-titulo">
              Ideas que pasan
              <br />a la mesa de trabajo.
            </h2>
            <p>
              Aprender, experimentar y compartir el proceso con otras personas.
            </p>
          </div>
          <div className="topics">
            <article>
              <span className="topic-number">01</span>
              <div>
                <h3>Software y hardware</h3>
                <p>
                  Herramientas de hacking, recursos y tecnologías para explorar
                  en comunidad.
                </p>
              </div>
            </article>
            <article>
              <span className="topic-number">02</span>
              <div>
                <h3>Ethereum y seguridad</h3>
                <p>
                  Investigación, educación y conversaciones sobre el futuro
                  descentralizado.
                </p>
              </div>
            </article>
            <article>
              <span className="topic-number">03</span>
              <div>
                <h3>Encuentros y talleres</h3>
                <p>
                  Un punto de encuentro entre conocimiento técnico, creatividad
                  y comunidad local.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section
          id="contacto"
          className="contact-section"
          aria-labelledby="contacto-titulo"
        >
          <p className="section-index">03 / CONECTAR</p>
          <h2 id="contacto-titulo">Acercate al Nodo.</h2>
          <p>Conocé el proyecto y seguí las novedades de la comunidad.</p>
          <div className="contact-links">
            <a
              className="button"
              href="https://nodoserrano.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visitar Nodo Serrano <span aria-hidden="true">↗</span>
            </a>
            <a
              href="https://whatsapp.com/channel/0029VbAvlX0Gk1FnUUeDII3g"
              target="_blank"
              rel="noopener noreferrer"
            >
              Canal de novedades <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="wordmark" href="#inicio">
          NODO<span>SERRANO</span>
        </a>
        <p>HackerSpace · Tandil</p>
        <a
          href="https://instagram.com/nodoserrano"
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram ↗
        </a>
      </footer>
    </>
  );
}
