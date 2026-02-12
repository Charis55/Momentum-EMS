import React from "react";
import { motion } from "framer-motion";

export default function AnimatedStats({value, label}) {
  return (
    <motion.div className="stat" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.6}}>
      <div className="num" aria-live="polite">{value}</div>
      <div style={{fontSize:12}}>{label}</div>
    </motion.div>
  );
}
