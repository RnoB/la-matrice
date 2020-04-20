

class InputKey
{
    constructor()
    {
    document.body.addEventListener('keydown', keyPressed);
    document.body.addEventListener('keyup', keyReleased);
    this.keyMap = {};
    this.speed = .05;        
    }



    function setSpeed(newSpeed)
    {
        this.speed = newSpeed;
    }
    function keyPressed(e)
    {
        keyMap[e.key] = 'keydown';
        e.preventDefault();
    }

    function keyReleased(e)
    {   
      delete keyMap[e.key];
      e.preventDefault();
    }




    function inputPlayer(object)
    {


        for (var key in this.keyMap)
        {
            switch(key)
            {
                case "ArrowUp":
                object.translateY(this.speed);
                break;
                case "ArrowDown":
                object.translateY(-this.speed);
                break;
                case "ArrowLeft":
                object.rotateY(this.speed);
                break;
                case "ArrowRight":
                object.rotateY(-this.speed);
                break;
                case "z":
                case "w":
                object.translateZ(-this.speed);
                break;
                case "s":
                object.translateZ(+this.speed);
                break;
                case "a":
                case "q":
                object.translateX(-this.speed);
                break;
                case "d":
                object.translateX(+this.speed);
                break;
            }
        }

    }
}