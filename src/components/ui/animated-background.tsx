import { useEffect, useRef, useState } from 'react';

interface AnimatedBokehLavaLampCanvasProps {
  className?: string;
}

export function AnimatedBackground({ className = "" }: AnimatedBokehLavaLampCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const mobileCheck = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsMobile(mobileCheck);

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    let ctx = canvas.getContext('2d');
    let animationFrameId: number;

    // Helper function to draw a blurred circle using radial gradients
    const drawBlurredCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, blur: number, color1: string, color2: string) => {
      // Save the current context state
      ctx.save();
      
      // Create a radial gradient for the blur effect
      const gradient = ctx.createRadialGradient(
          x, y, 0,
          x, y, radius + blur
      );
      
      // Add color stops for the gradient
      gradient.addColorStop(0, color1);
      gradient.addColorStop(0.8, color2);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      // Draw the gradient
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius + blur, 0, Math.PI * 2);
      ctx.fill();
      
      // Restore the context state
      ctx.restore();
    };

    const rand = (min: number, max: number) => Math.random() * (max - min) + min;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.globalCompositeOperation = isMobile ? 'screen' : 'lighter';
      }
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    // Adjust parameters based on device
    const count = isMobile ? 30 : 70; // Fewer particles on mobile
    const blur = isMobile ? [15, 35] : [30, 70]; // Reduced blur on mobile
    const radius = isMobile ? [5, 60] : [10, 120]; // Smaller radius on mobile
    
    const backgroundColors = [ '#000000', '#18181b' ]; // dark gray
    const colors = [
      [ '#002aff', "#009ff2" ],
      [ '#0054ff', '#27e49b' ], 
      [ '#202bc5' ,'#873dcc' ]
    ];

    if (!ctx) return;

    ctx.clearRect( 0, 0, canvas.width, canvas.height );
    ctx.globalCompositeOperation = isMobile ? 'screen' : 'lighter';
    const grd = ctx.createLinearGradient(0, canvas.height, canvas.width, 0);
    grd.addColorStop(0, backgroundColors[0]);
    grd.addColorStop(1, backgroundColors[1]);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const items: Array<{
      x: number;
      y: number;
      blur: number;
      radius: number;
      initialXDirection: number;
      initialYDirection: number;
      initialBlurDirection: number;
      colorOne: string;
      colorTwo: string;
      gradient: number[];
    }> = [];

    let tempCount = count;
    while(tempCount--) {
      const thisRadius = rand( radius[0], radius[1] );
      const thisBlur = rand( blur[0], blur[1] );
      const x = rand( -100, canvas.width + 100 );
      const y = rand( -100, canvas.height + 100 );
      const colorIndex = Math.floor(rand(0, 299) / 100);
      const colorOne = colors[colorIndex][0];
      const colorTwo = colors[colorIndex][1];
      
      // Use the custom blur function
      drawBlurredCircle(
        ctx,
        x,
        y,
        thisRadius,
        thisBlur * 0.8, // Slightly reduce blur intensity for better performance
        colorOne,
        colorTwo
      );
      
      // Draw the main circle with less blur for better color
      ctx.beginPath();
      const grd = ctx.createLinearGradient(
        x - thisRadius / 2,
        y - thisRadius / 2,
        x + thisRadius,
        y + thisRadius
      );
      grd.addColorStop(0, colorOne);
      grd.addColorStop(1, colorTwo);
      ctx.fillStyle = grd;
      ctx.arc(x, y, thisRadius * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
      const directionX = Math.round(rand(-99, 99) / 100);
      const directionY = Math.round(rand(-99, 99) / 100);
      items.push({
        x: x,
        y: y,
        blur: thisBlur,
        radius: thisRadius,
        initialXDirection: directionX,
        initialYDirection: directionY,
        initialBlurDirection: directionX,
        colorOne: colorOne,
        colorTwo: colorTwo,
        gradient: [ x - thisRadius / 2, y - thisRadius / 2, x + thisRadius, y + thisRadius ],
      });
    }

    function changeCanvas() {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const adjX = 2;
      const adjY = 2;
      const adjBlur = 1;
      items.forEach(function(item) {
        if(item.x + (item.initialXDirection * adjX) >= canvas.width && item.initialXDirection !== 0 || item.x + (item.initialXDirection * adjX) <= 0 && item.initialXDirection !== 0) {
          item.initialXDirection = item.initialXDirection * -1;
        }
        if(item.y + (item.initialYDirection * adjY) >= canvas.height && item.initialYDirection !== 0 || item.y + (item.initialYDirection * adjY) <= 0 && item.initialYDirection !== 0) {
          item.initialYDirection = item.initialYDirection * -1;
        }
        if(item.blur + (item.initialBlurDirection * adjBlur) >= radius[1] && item.initialBlurDirection !== 0 || item.blur + (item.initialBlurDirection * adjBlur) <= radius[0] && item.initialBlurDirection !== 0) {
          item.initialBlurDirection *= -1;
        }
        item.x += (item.initialXDirection * adjX);
        item.y += (item.initialYDirection * adjY);
        item.blur += (item.initialBlurDirection * adjBlur);
        ctx.beginPath();
        ctx.filter = `blur(${item.blur}px)`;
        const grd = ctx.createLinearGradient(item.gradient[0], item.gradient[1], item.gradient[2], item.gradient[3]);
        grd.addColorStop(0, item.colorOne);
        grd.addColorStop(1, item.colorTwo);
        ctx.fillStyle = grd;
        ctx.arc( item.x, item.y, item.radius, 0, Math.PI * 2 );
        ctx.fill();
        ctx.closePath();
      });
      animationFrameId = window.requestAnimationFrame(changeCanvas);
    }
    animationFrameId = window.requestAnimationFrame(changeCanvas);
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [isMobile]);

  return (
    <canvas
      ref={canvasRef}
      className={"absolute left-0 top-0 w-full h-full object-cover z-0 " + className}
      aria-hidden="true"
      tabIndex={-1}
      style={{
        pointerEvents: 'none',
        minHeight: '100vh',
        // Improve mobile rendering
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        // Prevent white flashes on mobile
        backgroundColor: '#000000',
        // Optimize GPU acceleration
        willChange: 'transform',
        // Better image rendering
        imageRendering: isMobile ? 'crisp-edges' : 'auto'
      }}
    />
  );
}