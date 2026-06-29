export abstract class Event {
  public readonly name: string;
  public readonly timestamp: Date;
  public readonly payload: Record<string, unknown>;

  constructor(name: string, payload: Record<string, unknown> = {}) {
    this.name = name;
    this.timestamp = new Date();
    this.payload = payload;
  }
}

export class UserEvent extends Event {
  constructor(name: string, payload: Record<string, unknown>) {
    super(`user.${name}`, payload);
  }
}

export class GroupEvent extends Event {
  constructor(name: string, payload: Record<string, unknown>) {
    super(`group.${name}`, payload);
  }
}

export class ContributionEvent extends Event {
  constructor(name: string, payload: Record<string, unknown>) {
    super(`contribution.${name}`, payload);
  }
}

export class PaymentEvent extends Event {
  constructor(name: string, payload: Record<string, unknown>) {
    super(`payment.${name}`, payload);
  }
}

export class PayoutEvent extends Event {
  constructor(name: string, payload: Record<string, unknown>) {
    super(`payout.${name}`, payload);
  }
}

export class SecurityEvent extends Event {
  constructor(name: string, payload: Record<string, unknown>) {
    super(`security.${name}`, payload);
  }
}

export class GenericEvent extends Event {
  constructor(name: string, payload: Record<string, unknown>) {
    super(name, payload);
  }
}
