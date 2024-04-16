export function collisionPaddleBall(playerPaddle, computerPaddle, ball) {
	if (isCollisionPlayerBall(playerPaddle.rect(), ball.rect()) && ball.direction.x < 0) {
		ball.direction.x *= -1
		changeBallDirectionOnBounce(playerPaddle, ball)
	}
		if (isCollisionComputerBall(computerPaddle.rect(), ball.rect()) && ball.direction.x > 0) {
		ball.direction.x *= -1
		changeBallDirectionOnBounce(computerPaddle, ball)
	}
}

function isCollisionPlayerBall(playerPaddleRect, ballRect) {
	return (
		playerPaddleRect.top <= ballRect.bottom &&
		playerPaddleRect.bottom >= ballRect.top &&
		playerPaddleRect.right >= ballRect.left &&
		playerPaddleRect.left < ballRect.right
	)
}

function isCollisionComputerBall(computerPaddleRect, ballRect) {
	return (
		computerPaddleRect.top <= ballRect.bottom &&
		computerPaddleRect.bottom >= ballRect.top &&
		computerPaddleRect.left <= ballRect.right &&
		computerPaddleRect.right > ballRect.left
	)
}

//if any collision return true
export function isCollision(rect1, rect2) {
	return (
		rect1.left <= rect2.right &&
		rect1.right >= rect2.left &&
		rect1.top <= rect2.bottom &&
		rect1.bottom >= rect2.top
	)
}

export function randomNumberBetween(min, max)
{
	return Math.random() * (max - min) + min
}

// interpolate the value of x in the linear function defined by two points (x1, y1 and x2, y2)
// returns y (f(x))
export function linearInterpolation (x, x1, y1, x2, y2) {
	return y1 + (x - x1) * (y2 - y1) / (x2 - x1)
}


// game is more enjoyable, brings variability
// following the point of bounce of the ball on the paddle, the direction of the ball is changed
// TODO: improve realistic of the bounce by adding and subtracting to the current direction
export function changeBallDirectionOnBounce(paddle, ball) {
	let ballPos = ball.mesh.position.y

	// keeps track of the original direction of the ball
	if (ball.direction.x < 0) {
		ball.direction.x = Math.cos(paddle.linearInterpolationBounce(ballPos)) * -1
	}
	else {
		ball.direction.x = Math.cos(paddle.linearInterpolationBounce(ballPos))
	}
	ball.direction.y = Math.sin(paddle.linearInterpolationBounce(ballPos))
}