import { Card } from 'react-native-elements'

/* Wraps every collection of elements in a Form. Can be nested */

export default function CardWrap({
  index,
  title,
  description,
  inner,
  subparts,
}) {
  return (
    <Card key={index}>
      <Card.Title>{title}</Card.Title>
      {description}
      {inner}
      {subparts}
    </Card>
  )
}
