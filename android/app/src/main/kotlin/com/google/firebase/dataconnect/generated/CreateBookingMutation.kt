
@file:kotlin.Suppress(
  "KotlinRedundantDiagnosticSuppress",
  "LocalVariableName",
  "MayBeConstant",
  "RedundantVisibilityModifier",
  "RemoveEmptyClassBody",
  "SpellCheckingInspection",
  "LocalVariableName",
  "unused",
)

package com.google.firebase.dataconnect.generated



public interface CreateBookingMutation :
    com.google.firebase.dataconnect.generated.GeneratedMutation<
      ExampleConnector,
      CreateBookingMutation.Data,
      CreateBookingMutation.Variables
    >
{
  
    @kotlinx.serialization.Serializable
  public data class Variables(
  
    val eventId: @kotlinx.serialization.Serializable(with = com.google.firebase.dataconnect.serializers.UUIDSerializer::class) java.util.UUID,
    val ticketTypeId: @kotlinx.serialization.Serializable(with = com.google.firebase.dataconnect.serializers.UUIDSerializer::class) java.util.UUID,
    val quantity: Int
  ) {
    
    
  }
  

  
    @kotlinx.serialization.Serializable
  public data class Data(
  
    val booking_insert: BookingKey
  ) {
    
    
  }
  

  public companion object {
    public val operationName: String = "CreateBooking"

    public val dataDeserializer: kotlinx.serialization.DeserializationStrategy<Data> =
      kotlinx.serialization.serializer()

    public val variablesSerializer: kotlinx.serialization.SerializationStrategy<Variables> =
      kotlinx.serialization.serializer()
  }
}

public fun CreateBookingMutation.ref(
  
    eventId: java.util.UUID,ticketTypeId: java.util.UUID,quantity: Int,
  
  
): com.google.firebase.dataconnect.MutationRef<
    CreateBookingMutation.Data,
    CreateBookingMutation.Variables
  > =
  ref(
    
      CreateBookingMutation.Variables(
        eventId=eventId,ticketTypeId=ticketTypeId,quantity=quantity,
  
      )
    
  )

public suspend fun CreateBookingMutation.execute(
  
    eventId: java.util.UUID,ticketTypeId: java.util.UUID,quantity: Int,
  
  
  ): com.google.firebase.dataconnect.MutationResult<
    CreateBookingMutation.Data,
    CreateBookingMutation.Variables
  > =
  ref(
    
      eventId=eventId,ticketTypeId=ticketTypeId,quantity=quantity,
  
    
  ).execute()


