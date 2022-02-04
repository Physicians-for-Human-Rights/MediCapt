import { Card } from 'react-native-elements'

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
