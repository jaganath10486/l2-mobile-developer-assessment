import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';

const { width, height } = Dimensions.get('window');


const BalloonGame = () => {
  const [balloons, setBalloons] = useState([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [timeLeftColor, setTimeLeftColor] = useState('black');
  const [speed, setSpeed] = useState(2);
  const [balloonsCnt, setBalloonsCnt] = useState(5);
  const [poppedCnt, setPoppedCnt] = useState(0);
  const [missedCnt, setMessedCnt] = useState(0);


  //To handle the Time Left and increase the speed of the balloon as the time left is decreasing.
  useEffect(() => {
    let timeLeftInterval;
    if (gameStarted) {
      timeLeftInterval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime === 0) {
            clearInterval(timeLeftInterval);
            setGameStarted(false);
          }
          else if (prevTime == 80) {
            setBalloonsCnt((prev) => prev + 1);
            setSpeed((prev) => prev + 1);
          }
          else if (prevTime == 60) {
            setBalloonsCnt((prev) => prev + 2);
            setSpeed((prev) => prev + 2);
            setTimeLeftColor('orange');
          }
          else if (prevTime == 10) {
            setTimeLeftColor('red');
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timeLeftInterval);
  }, [gameStarted]);


  //To handle the New Balloon Creation
  useEffect(() => {
    let timer;
    let balloonInterval;

    if (gameStarted) {
      balloonInterval = setInterval(() => {
        if (balloons.length < balloonsCnt) {
          setBalloons(prevBalloons => [...prevBalloons, {
            id: Math.random().toString(),
            position: {
              x: Math.random() * (width - 50),
              y: height,
            },
            speed: Math.random() * speed + 5,
            opacity: new Animated.Value(1),
          }]);
        }
      }, 1000);

      timer = setTimeout(() => {
        clearInterval(balloonInterval);
        setGameStarted(false);
      }, 120000);

      return () => {
        clearInterval(balloonInterval);
        clearTimeout(timer);
      };
    }
  }, [gameStarted, balloons.length]);


  //To handle the Balloon On Press
  const handleBalloonOnPress = (balloonId) => {

    setBalloons(prevBalloons => prevBalloons.filter(balloon => balloon.id !== balloonId));
    setScore(prevScore => prevScore + 2);
    setPoppedCnt((prev) => prev + 1);
  };

  // To handle the Balloon Miss
  const handleBalloonOnMiss = () => {
    setScore(prevScore => prevScore - 1);
    setMessedCnt((prev) => prev + 1);
  };

  // To handle the Balloon Move to top from bottom
  const moveBalloons = () => {
    setBalloons(prevBalloons =>
      prevBalloons.map(balloon => ({
        ...balloon,
        position: {
          x: balloon.position.x,
          y: balloon.position.y - balloon.speed,
        },
      })).filter(balloon => {
        if (balloon.position.y < 140) {
          handleBalloonOnMiss();
          return false;
        }
        return true;
      })
    );
  };

  useEffect(() => {
    if (gameStarted) {
      const moveInterval = setInterval(moveBalloons, 50);
      return () => clearInterval(moveInterval);
    }
  }, [moveBalloons]);

  const handleStartGame = () => {
    setScore(0);
    setBalloons([]);
    setTimeLeft(120);
    setGameStarted(true);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  };


  return (
    <View style={styles.container}>

      {gameStarted && (
        <>
          <View style={{ flex: 1, justifyContent: 'space-between', paddingTop: 50, flexDirection : 'row' }}>
            <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center' }}>
              <Text style={[styles.score, { color: 'green' }]}>Balloons Popped: {poppedCnt}</Text>
              <Text style={[styles.score, { color: 'red' }]}>Balloons Missed: {missedCnt}</Text>
            </View>
            <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center' }}>
              <Text style={[styles.timer, { color: timeLeftColor }]}>Time Left: {formatTime(timeLeft)}</Text>
              <Text style={styles.score}>Score: {score}</Text>
            </View>
          </View>

          <>
            {balloons.map(balloon => (
              <TouchableOpacity key={balloon.id}
                style={[styles.balloon, { top: balloon.position.y, left: balloon.position.x, opacity: balloon.opacity }]}
                onPress={() => {
                  Animated.timing(balloon.opacity, {
                    toValue: 0,
                    duration: 20,
                    useNativeDriver: true,
                  }).start(() => {
                    handleBalloonOnPress(balloon.id);
                  });
                }}><Image style={styles.img} source={require('./assets/balloon.png')} /></TouchableOpacity>

            ))}
          </>
        </>
      )}
      {!gameStarted && (
        <TouchableOpacity style={styles.btn}>
          <Text style={styles.btnText} onPress={handleStartGame}> {score ? 'Play Again' : 'Start Game'}</Text>
          {
            score ? (<><Text style={styles.Score}>Score: {score}</Text></>) : (<></>)
          }
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  balloon: {
    position: 'absolute',
    fontSize: 45,
  }
  ,
  score: {
    fontWeight: 'bold',
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 15,
    fontSize: 14,
  },
  timer: {
    backgroundColor: "#fff",
    fontSize: 14,
    padding: 10,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  btn: {
    alignItems: 'center',
  },
  btnText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#000",
    color: "#fff",
    borderRadius: 10,
    minWidth: 200,
    textAlign: 'center'
  },
  Score: {
    fontSize: 18,
    color: "black"
  },
  img: {
    width: 50,
    height: 50
  }
});

export default BalloonGame;
