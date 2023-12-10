```mermaid
sequenceDiagram
participant User
participant UserInterface
participant Multiplexer
participant PartyHandler

activate User
activate Multiplexer
activate UserInterface
User->>UserInterface: Select radius and budget
User->>UserInterface: Start Matchmaking
UserInterface->>Multiplexer: Send matchmaking party message
Multiplexer->>PartyHandler: Matchmaking party request
activate PartyHandler


PartyHandler->>UserInterface: Send no party found message
deactivate PartyHandler




deactivate Multiplexer
deactivate User
deactivate UserInterface

```
