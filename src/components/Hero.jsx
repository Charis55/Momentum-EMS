import React from "react";
import { motion } from "framer-motion";

/**
 * Animated hero for Momentum EMS
 * - decorative SVG blobs
 * - animated text/CTA
 */
export default function Hero() {
  return (
    <section className="hero" role="region" aria-label="Momentum EMS hero">
      {/* decorative blurred blobs */}
      <svg width="0" height="0" style={{position:'absolute'}}>
        <defs>
          <filter id="soften"><feGaussianBlur stdDeviation="30" /></filter>
        </defs>
      </svg>

      <div className="blob" style={{left:-80, top:-60, width:420, height:420, background:'radial-gradient(circle at 30% 30%, #6f5af8, transparent 40%)'}}></div>
      <div className="blob" style={{right:-140, bottom:-60, width:360, height:360, background:'radial-gradient(circle at 60% 40%, rgba(58,87,232,0.8), transparent 35%)'}}></div>

      <div className="hero-left">
        <motion.div initial={{opacity:0,y:22}} animate={{opacity:1,y:0}} transition={{duration:0.8}}>
          <h2>Momentum EMS — build accessible, engaging webinars</h2>
          <p>Design, manage and run webinars optimized for everyone — captions, transcripts, keyboard-first flows, and rich analytics built-in.</p>

          <div className="stats-row" aria-hidden>
            <motion.div className="stat" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.4}}>
              <div className="num">3</div>
              <div style={{fontSize:12}}>Active events</div>
            </motion.div>
            <motion.div className="stat" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.55}}>
              <div className="num">245</div>
              <div style={{fontSize:12}}>Total registrations</div>
            </motion.div>
            <motion.div className="stat" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.7}}>
              <div className="num">₦1.25M</div>
              <div style={{fontSize:12}}>Revenue</div>
            </motion.div>
          </div>

          <div style={{marginTop:18}}>
            <motion.a whileHover={{scale:1.03}} whileTap={{scale:.98}} className="btn btn-primary" href="/dashboard" role="button">Go to Dashboard</motion.a>
            <motion.a whileHover={{scale:1.03}} style={{marginLeft:12}} className="btn btn-ghost" href="#features" role="button">Explore features</motion.a>
          </div>
        </motion.div>
      </div>

      <div className="hero-right" aria-hidden>
        <motion.div initial={{opacity:0, y:8}} animate={{opacity:1,y:0}} transition={{delay:0.4}}>
          <img src="/assets/hero-visual.jpg" alt="Illustration showing webinar dashboard" />
        </motion.div>
      </div>
    </section>
  );
}
