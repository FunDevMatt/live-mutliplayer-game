<template>
    <div id="board">
        <canvas></canvas>

    </div>
</template>

<script>
export default {
    name: 'Game-Canvas',
    mounted() {
        let canvas = document.querySelector("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let c = canvas.getContext("2d");

        // c.fillStyle = "yellow"
        // c.fillRect(100, 100, 200, 200);
        
        // c.fillStyle = "orange"
        // c.fillRect(30, 30, 200, 200);


        // c.beginPath();
        // c.moveTo(50, 300);
        // c.lineTo(300, 100);
        // c.lineTo(600, 600)

        // c.strokeStyle = "red"
        // c.stroke();

        

        // let x = 100;
        // let y = 100;
        // for (let i = 0; i <= 10; i++) {
        //     c.beginPath();
        //     c.arc(x, y, 30, 0, Math.PI * 2, false);
        //     c.strokeStyle = "blue"
        //     c.stroke();
        //     x += 100;
        //     y += 100;
        //  }
         

        let x = Math.random() * innerWidth;
        let y = Math.random() * innerHeight;
        let dx = Math.random() - .05;
        let dy = Math.random() - .05;
        let radius = 30;
        
         let animate = () => {
            requestAnimationFrame(animate);
            c.clearRect(0, 0, innerWidth, innerHeight);

            c.beginPath();
            c.arc(x, y, radius, 0, Math.PI * 2, false);
            c.strokeStyle = "blue";
            c.stroke();
            if (x + radius >= innerWidth || x - radius <= 0) {
                dx = -dx;
            }
            if (y + radius >= innerHeight || y - radius <= 0) {
                c.strokeStyle = "red";
                c.stroke();
                dy = -dy
            }
            x += dx;
            y += dy;
    


    
         }
         animate();

    }
    
}
</script>

<style lang="scss">
    canvas {
        background-color: rgb(37, 189, 32);
    }
    

</style>
